import React from 'react';
import { Routes, Route } from 'react-router-dom';

import AdminDashboardShell from './AdminDashboardShell';
import AdminDashboardHome from './AdminDashboardHome';
import AdminUsers from './AdminUsers';
import AdminPayments from './AdminPayments';
import PayrollSection from './PayrollSection';
import AdminSupport from './AdminSupport';
import AdminApplications from './AdminApplications';
import AdminBikes from './AdminBikes';
import Subscribe from './Subscribe';
import Supportive from './Supportive';

export default function AdminDashboardRoutes() {
  return (
    <Routes>
      <Route path="/admin-dashboard" element={<AdminDashboardShell />}>
        <Route index element={<AdminDashboardHome />} />
        <Route path="users" element={<AdminUsers />} />
  <Route path="bikes" element={<AdminBikes />} />
        <Route path="payments" element={<AdminPayments />} />
  <Route path="support" element={<AdminSupport />} />
  <Route path="application" element={<AdminApplications />} />
  <Route path="payroll" element={<PayrollSection users={[]} onUserAdded={() => {}} />} />
  <Route path="subscribe" element={<Subscribe />} />
  <Route path="supportive" element={<Supportive />} />
      </Route>
    </Routes>
  );
}