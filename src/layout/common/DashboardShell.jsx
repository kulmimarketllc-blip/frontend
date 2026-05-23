import React, { useState } from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';

const DashboardShell = ({
  panelLabel,
  navSections,
  user,
  actionButtons = [],
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-navy flex h-screen flex-col overflow-hidden">
      <DashboardHeader
        panelLabel={panelLabel}
        mobileOpen={mobileOpen}
        onToggleMobileMenu={() => setMobileOpen((prev) => !prev)}
        actionButtons={actionButtons}
        user={user}
      />

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 min-[700px]:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <DashboardSidebar
          navSections={navSections}
          mobileOpen={mobileOpen}
          onSelectItem={() => setMobileOpen(false)}
        />

        <main className="bg-navy flex-1 overflow-y-auto min-[700px]:ml-0">
          <div className="min-h-full p-4 min-[700px]:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;