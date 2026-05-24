import React, { useState, useRef } from 'react';
import { Save, Upload, X } from 'lucide-react';
import MerchantPageHeader from '../components/MerchantPageHeader';
import { createProduct, getProductById, updateProduct } from '../../../services/productService';
import { useParams, useNavigate } from 'react-router-dom';

const initialForm = {
  name: '',
  description: '',
  categoryId: 'electronics',
  sku: '',
  price: '',
  comparePrice: '',
  stock: '',
  lowStockAt: '10',
  imageFiles: [],
  isFeatured: false,
  colors: '',
  sizes: '',
};

const MerchantAddProduct = ({ onNav, productId: propProductId }) => {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const maxFiles = 8;
    const maxSize = 5 * 1024 * 1024; // 5MB per file

    // Validate total files count
    const existingCount = (form.imageFiles || []).length;
    if (existingCount + files.length > maxFiles) {
      setError(`You can upload up to ${maxFiles} images.`);
      return;
    }

    const validFiles = [];
    const previews = [];

    const readers = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('All files must be valid images');
        return;
      }
      if (file.size > maxSize) {
        setError('Each image must be less than 5MB');
        return;
      }
      validFiles.push(file);

      const reader = new FileReader();
      readers.push(new Promise((resolve, reject) => {
        reader.onload = (ev) => {
          previews.push(ev.target?.result || '');
          resolve();
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }));
    }

    Promise.all(readers)
      .then(() => {
        // append to existing
        const nextFiles = [...(form.imageFiles || []), ...validFiles];
        const nextPreviews = [...imagePreviews, ...previews];
        update('imageFiles', nextFiles);
        setImagePreviews(nextPreviews);
        setError('');
      })
      .catch(() => setError('Failed to read image files'));
  };

  const removeImage = (index) => {
    // if no index provided, clear all
    if (typeof index !== 'number') {
      setImagePreviews([]);
      update('imageFiles', []);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const nextPreviews = [...imagePreviews];
    const nextFiles = [...(form.imageFiles || [])];
    nextPreviews.splice(index, 1);
    nextFiles.splice(index, 1);
    setImagePreviews(nextPreviews);
    update('imageFiles', nextFiles);
    if (fileInputRef.current && nextFiles.length === 0) fileInputRef.current.value = '';
  };

  const params = useParams();
  const navigate = useNavigate();
  const productId = propProductId || params?.id;

  // Load product when editing
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!productId) return;
      try {
        setLoading(true);
        const p = await getProductById(productId);
        if (!mounted) return;
        // Map product to form
        setForm((prev) => ({
          ...prev,
          name: p.name || '',
          description: p.description || '',
          categoryId: p.category?.slug || p.categoryId || prev.categoryId,
          sku: p.sku || '',
          price: String(p.price || ''),
          comparePrice: p.comparePrice != null ? String(p.comparePrice) : '',
          stock: String(p.stock || ''),
          lowStockAt: String(p.lowStockAt ?? '10'),
          imageFiles: [],
          isFeatured: !!p.isFeatured,
        }));
        setImagePreviews(Array.isArray(p.images) ? p.images : []);
        setMessage('');
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const parseList = (value) =>
    String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const submit = async () => {
    try {
      setSaving(true);
      setError('');
      setMessage('');

      if (!form.name.trim() || !form.description.trim() || !form.price || !form.stock) {
        setError('Please fill name, description, price, and stock.');
        return;
      }

      // For new products require an image; for edits allow if existing images present
      const hasExistingImages = imagePreviews && imagePreviews.length > 0;
      const hasNewFiles = form.imageFiles && form.imageFiles.length > 0;
      if (!productId && !hasNewFiles) {
        setError('Please upload at least one product image.');
        return;
      }
      if (productId && !hasExistingImages && !hasNewFiles) {
        setError('Please provide at least one product image or upload a new one.');
        return;
      }

      // Create FormData payload in the format expected by backend
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('categoryId', form.categoryId);
      formData.append('price', String(Number(form.price)));
      formData.append('stock', String(Number(form.stock)));
      if (form.comparePrice) formData.append('comparePrice', String(Number(form.comparePrice)));
      if (form.sku) formData.append('sku', String(form.sku));
      if (form.lowStockAt) formData.append('lowStockAt', String(Number(form.lowStockAt)));
      formData.append('isFeatured', String(!!form.isFeatured));

      // Include existing image URLs (so backend keeps them) when editing
      if (productId && Array.isArray(imagePreviews)) {
        imagePreviews.forEach((url) => {
          if (typeof url === 'string' && url.startsWith('http')) formData.append('images', url);
        });
      }

      // Append uploaded files
      if (form.imageFiles && form.imageFiles.length) {
        form.imageFiles.forEach((f) => formData.append('images', f, f.name));
      }

      if (productId) {
        await updateProduct(productId, formData);
        setMessage('Product updated successfully.');
        setTimeout(() => navigate('/merchant/products'), 800);
      } else {
        await createProduct(formData);
        setMessage('Product submitted successfully and is now pending admin review.');
        removeImage();
        setForm(initialForm);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <MerchantPageHeader
          title={productId ? <><span>Edit </span><span className="text-teal">Product</span></> : <><span>Add New </span><span className="text-teal">Product</span></>}
          subtitle={productId ? 'Update your product listing' : 'Create a new listing for your store'}
        />
        <div className="flex gap-2.5">
          <button
            onClick={() => onNav?.('products')}
            className="text-gray hover:border-teal hover:text-teal rounded border border-white/10 px-4 py-1.5 text-[0.8rem] font-bold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="bg-teal text-navy hover:bg-teal2 disabled:opacity-70 flex items-center gap-1.5 rounded border border-transparent px-4 py-1.5 text-[0.8rem] font-bold transition-all"
          >
            <Save size={14} strokeWidth={3} /> {saving ? (productId ? 'Saving...' : 'Submitting...') : (productId ? 'Save Changes' : 'Submit for Review')}
          </button>
        </div>
      </div>

      {message ? <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">{message}</div> : null}
      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}

      <div className="grid grid-cols-1 gap-6 min-[1100px]:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-white/[0.07] p-6 lg:p-8">
            <h3 className="mb-5 font-syne text-[1.1rem] font-bold text-white">Product Details</h3>

            <div className="mb-5">
              <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Product Name</label>
              <input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none"
                placeholder="e.g. Wireless Earbuds Pro Max"
              />
            </div>

            <div className="mb-5">
              <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className="bg-navy3 focus:border-teal h-32 w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none resize-none"
                placeholder="Describe your product specs..."
              />
            </div>

            <div className="grid grid-cols-1 gap-5 min-[580px]:grid-cols-2">
              <div>
                <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => update('categoryId', e.target.value)}
                  className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none"
                >
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home-garden">Home & Garden</option>
                  <option value="beauty">Beauty</option>
                  <option value="food-grocery">Food & Grocery</option>
                  <option value="sports">Sports</option>
                  <option value="books">Books</option>
                  <option value="toys-kids">Toys & Kids</option>
                  <option value="tools-diy">Tools & DIY</option>
                  <option value="pet-supplies">Pet Supplies</option>
                  <option value="health">Health</option>
                </select>
              </div>

              <div>
                <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">SKU</label>
                <input
                  value={form.sku}
                  onChange={(e) => update('sku', e.target.value)}
                  className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none"
                  placeholder="e.g. TZ-EAR-006"
                />
              </div>

              <div>
                <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Price ($)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => update('price', e.target.value)}
                  className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none"
                  placeholder="49.99"
                />
              </div>

              <div>
                <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Compare At ($)</label>
                <input
                  type="number"
                  value={form.comparePrice}
                  onChange={(e) => update('comparePrice', e.target.value)}
                  className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none"
                  placeholder="89.99"
                />
              </div>

              <div>
                <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Stock Quantity</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => update('stock', e.target.value)}
                  className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Alert At</label>
                <input
                  type="number"
                  value={form.lowStockAt}
                  onChange={(e) => update('lowStockAt', e.target.value)}
                  className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none"
                  placeholder="10"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-white/[0.07] p-6 lg:p-8">
            <h3 className="mb-5 font-syne text-[1.1rem] font-bold text-white">Product Media</h3>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              aria-label="Upload product images"
            />

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="bg-navy3 h-28 w-full rounded border border-white/[0.07] object-cover"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="bg-red/80 hover:bg-red absolute right-2 top-2 rounded p-1 text-white transition-all"
                      title="Remove image"
                    >
                      <X size={16} strokeWidth={2.2} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-white/10 hover:border-teal/50 bg-navy3/50 hover:bg-navy3/80 mb-4 flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed px-6 py-12 text-center transition-all"
            >
              <Upload size={28} className="text-teal mb-3" strokeWidth={1.5} />
              <p className="text-gray mb-1 font-semibold">
                {imagePreviews.length > 0 ? 'Add more images' : 'Click to upload images'}
              </p>
              <p className="text-gray2 text-[0.8rem]">or drag and drop</p>
              <p className="text-gray2 mt-2 text-[0.75rem]">PNG, JPG, GIF up to 5MB each</p>
            </div>

            {form.imageFiles && form.imageFiles.length > 0 && (
              <div className="text-gray2 mt-2 text-[0.8rem] space-y-1">
                {form.imageFiles.map((f, i) => (
                  <div key={i}>✓ {f.name} ({(f.size / 1024).toFixed(2)} KB)</div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-lg border border-white/[0.07] p-6 lg:p-8">
            <h3 className="mb-5 font-syne text-[1.1rem] font-bold text-white">Visibility</h3>
            <label className="text-gray2 inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => update('isFeatured', e.target.checked)}
                className="accent-teal"
              />
              Mark as featured product
            </label>
          </div>

          <div className="bg-card rounded-lg border border-white/[0.07] p-6 lg:p-8">
            <h3 className="mb-5 font-syne text-[1.1rem] font-bold text-white">Variants</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Colors</label>
                <input
                  value={form.colors}
                  onChange={(e) => update('colors', e.target.value)}
                  className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none"
                  placeholder="e.g. Red, Black, White"
                />
              </div>

              <div>
                <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Sizes</label>
                <input
                  value={form.sizes}
                  onChange={(e) => update('sizes', e.target.value)}
                  className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none"
                  placeholder="e.g. S, M, L, XL"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantAddProduct;
