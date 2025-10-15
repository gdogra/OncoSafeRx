import React, { useEffect, useState } from 'react';
import { adminApi } from '../../utils/adminApi';

type DeployState = {
  netlify: any;
  render: any;
  warnings: string[];
};

const DeployStatusPanel: React.FC = () => {
  const [data, setData] = useState<DeployState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await adminApi.get('/api/admin/deploy/status');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load deploy status');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getAccessToken = (): string | null => {
    try { const raw = localStorage.getItem('osrx_auth_tokens'); return raw ? JSON.parse(raw).access_token : null; } catch { return null; }
  };

  return (
    <div className="border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Deploy Status</h3>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>
      {loading && <div className="text-sm text-gray-600">Loading...</div>}
      {error && <div className="text-sm text-red-700">{error}</div>}
      {!loading && !error && (
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {/* Netlify */}
          <div className="border rounded p-3">
            <div className="font-medium text-gray-800 mb-2">Netlify</div>
            {data?.warnings?.includes('netlify_not_configured') ? (
              <div className="text-gray-600">Not configured (set NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID on the server)</div>
            ) : data?.netlify ? (
              <div className="space-y-1">
                <div>Status: <span className="font-mono">{data.netlify.state}</span></div>
                <div>Commit: <span className="font-mono">{data.netlify.commit_ref?.slice(0,7) || 'n/a'}</span></div>
                <div>Updated: {new Date(data.netlify.updated_at).toLocaleString()}</div>
                {data.netlify.deploy_ssl_url && (
                  <a className="text-blue-600 hover:underline" href={data.netlify.deploy_ssl_url} target="_blank" rel="noreferrer">View deploy</a>
                )}
              </div>
            ) : (
              <div className="text-gray-600">Status unavailable</div>
            )}
          </div>
          {/* Render */}
          <div className="border rounded p-3">
            <div className="font-medium text-gray-800 mb-2">Render</div>
            {data?.warnings?.includes('render_not_configured') ? (
              <div className="text-gray-600">Not configured (set RENDER_API_KEY and RENDER_SERVICE_ID on the server)</div>
            ) : data?.render ? (
              <div className="space-y-1">
                <div>Status: <span className="font-mono">{data.render.status || data.render.deploy?.status || 'unknown'}</span></div>
                <div>Commit: <span className="font-mono">{(data.render.commit || data.render.gitCommit)?.slice(0,7) || 'n/a'}</span></div>
                <div>Updated: {new Date(data.render.updatedAt || data.render.createdAt || Date.now()).toLocaleString()}</div>
                {data.render.url && (
                  <a className="text-blue-600 hover:underline" href={data.render.url} target="_blank" rel="noreferrer">View deploy</a>
                )}
              </div>
            ) : (
              <div className="text-gray-600">Status unavailable</div>
            )}
          </div>
        </div>
      )}
      {!!data?.warnings?.length && (
        <div className="mt-3 text-xs text-gray-500">Warnings: {data.warnings.join(', ')}</div>
      )}
    </div>
  );
};

export default DeployStatusPanel;
