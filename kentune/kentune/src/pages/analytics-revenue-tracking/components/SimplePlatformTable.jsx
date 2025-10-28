import React from 'react';

const SimplePlatformTable = ({ data = [] }) => (
  <div className="bg-card rounded-lg border border-border p-6 shadow-card">
    <h2 className="text-lg font-semibold mb-4">All-Time Streams by Platform</h2>
    <table className="min-w-full divide-y divide-border">
      <thead>
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Platform</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Streams</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={2} className="px-4 py-6 text-center text-muted-foreground">No analytics data available yet.<br/>Analytics are posted monthly and may be delayed up to 2-3 months for new artists.</td>
          </tr>
        ) : (
          data.map((row, idx) => (
            <tr key={row.platform || idx}>
              <td className="px-4 py-2 font-medium">{row.platform}</td>
              <td className="px-4 py-2">{row.streams?.toLocaleString() ?? 0}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default SimplePlatformTable;
