var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../../../sites/common_site_config.json
var require_common_site_config = __commonJS({
  "../../../sites/common_site_config.json"(exports, module) {
    module.exports = {
      background_workers: 1,
      default_site: "urypos.erpdata.in",
      developer_mode: 1,
      dns_multitenant: false,
      file_watcher_port: 6827,
      frappe_user: "erpadmin",
      gunicorn_workers: 41,
      live_reload: true,
      maintenance_mode: 1,
      pause_scheduler: 1,
      rebase_on_pull: false,
      redis_cache: "redis://127.0.0.1:13040",
      redis_queue: "redis://127.0.0.1:11040",
      redis_socketio: "redis://127.0.0.1:13040",
      restart_supervisor_on_update: true,
      restart_systemd_on_update: false,
      serve_default_site: true,
      server_script_enabled: 1,
      shallow_clone: true,
      socketio_port: 9040,
      use_redis_auth: false,
      webserver_port: 8040
    };
  }
});

// vite.config.js
import path from "path";
import { defineConfig } from "file:///home/erpadmin/bench-urypos/apps/ury/URYMosaic/node_modules/vite/dist/node/index.js";
import vue from "file:///home/erpadmin/bench-urypos/apps/ury/URYMosaic/node_modules/@vitejs/plugin-vue/dist/index.mjs";

// proxyOptions.js
var common_site_config = require_common_site_config();
var { webserver_port } = common_site_config;
var proxyOptions_default = {
  "^/(app|api|assets|files)": {
    target: `http://localhost:${webserver_port}`,
    ws: true,
    router: function(req) {
      const site_name = req.headers.host.split(":")[0];
      return `http://${site_name}:${webserver_port}`;
    }
  }
};

// vite.config.js
var __vite_injected_original_dirname = "/home/erpadmin/bench-urypos/apps/ury/URYMosaic";
var vite_config_default = defineConfig({
  plugins: [vue()],
  server: {
    port: 8080,
    proxy: proxyOptions_default
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src")
    }
  },
  build: {
    outDir: "../ury/public/URYMosaic",
    emptyOutDir: true,
    target: "es2015"
    // rollupOptions: {
    // 	external: ["../../assets/alert/MA_Designed_ModifiedGunBlasts_4.wav"],
    //   },
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc2l0ZXMvY29tbW9uX3NpdGVfY29uZmlnLmpzb24iLCAidml0ZS5jb25maWcuanMiLCAicHJveHlPcHRpb25zLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJ7XG4gXCJiYWNrZ3JvdW5kX3dvcmtlcnNcIjogMSxcbiBcImRlZmF1bHRfc2l0ZVwiOiBcInVyeXBvcy5lcnBkYXRhLmluXCIsXG4gXCJkZXZlbG9wZXJfbW9kZVwiOiAxLFxuIFwiZG5zX211bHRpdGVuYW50XCI6IGZhbHNlLFxuIFwiZmlsZV93YXRjaGVyX3BvcnRcIjogNjgyNyxcbiBcImZyYXBwZV91c2VyXCI6IFwiZXJwYWRtaW5cIixcbiBcImd1bmljb3JuX3dvcmtlcnNcIjogNDEsXG4gXCJsaXZlX3JlbG9hZFwiOiB0cnVlLFxuIFwibWFpbnRlbmFuY2VfbW9kZVwiOiAxLFxuIFwicGF1c2Vfc2NoZWR1bGVyXCI6IDEsXG4gXCJyZWJhc2Vfb25fcHVsbFwiOiBmYWxzZSxcbiBcInJlZGlzX2NhY2hlXCI6IFwicmVkaXM6Ly8xMjcuMC4wLjE6MTMwNDBcIixcbiBcInJlZGlzX3F1ZXVlXCI6IFwicmVkaXM6Ly8xMjcuMC4wLjE6MTEwNDBcIixcbiBcInJlZGlzX3NvY2tldGlvXCI6IFwicmVkaXM6Ly8xMjcuMC4wLjE6MTMwNDBcIixcbiBcInJlc3RhcnRfc3VwZXJ2aXNvcl9vbl91cGRhdGVcIjogdHJ1ZSxcbiBcInJlc3RhcnRfc3lzdGVtZF9vbl91cGRhdGVcIjogZmFsc2UsXG4gXCJzZXJ2ZV9kZWZhdWx0X3NpdGVcIjogdHJ1ZSxcbiBcInNlcnZlcl9zY3JpcHRfZW5hYmxlZFwiOiAxLFxuIFwic2hhbGxvd19jbG9uZVwiOiB0cnVlLFxuIFwic29ja2V0aW9fcG9ydFwiOiA5MDQwLFxuIFwidXNlX3JlZGlzX2F1dGhcIjogZmFsc2UsXG4gXCJ3ZWJzZXJ2ZXJfcG9ydFwiOiA4MDQwXG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9lcnBhZG1pbi9iZW5jaC11cnlwb3MvYXBwcy91cnkvVVJZTW9zYWljXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9lcnBhZG1pbi9iZW5jaC11cnlwb3MvYXBwcy91cnkvVVJZTW9zYWljL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2VycGFkbWluL2JlbmNoLXVyeXBvcy9hcHBzL3VyeS9VUllNb3NhaWMvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xuaW1wb3J0IHByb3h5T3B0aW9ucyBmcm9tICcuL3Byb3h5T3B0aW9ucyc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuXHRwbHVnaW5zOiBbdnVlKCldLFxuXHRzZXJ2ZXI6IHtcblx0XHRwb3J0OiA4MDgwLFxuXHRcdHByb3h5OiBwcm94eU9wdGlvbnNcblx0fSxcblx0cmVzb2x2ZToge1xuXHRcdGFsaWFzOiB7XG5cdFx0XHQnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKVxuXHRcdH1cblx0fSxcblx0YnVpbGQ6IHtcblx0XHRvdXREaXI6ICcuLi91cnkvcHVibGljL1VSWU1vc2FpYycsXG5cdFx0ZW1wdHlPdXREaXI6IHRydWUsXG5cdFx0dGFyZ2V0OiAnZXMyMDE1Jyxcblx0XHQvLyByb2xsdXBPcHRpb25zOiB7XG5cdFx0Ly8gXHRleHRlcm5hbDogW1wiLi4vLi4vYXNzZXRzL2FsZXJ0L01BX0Rlc2lnbmVkX01vZGlmaWVkR3VuQmxhc3RzXzQud2F2XCJdLFxuXHRcdC8vICAgfSxcblx0fSxcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9lcnBhZG1pbi9iZW5jaC11cnlwb3MvYXBwcy91cnkvVVJZTW9zYWljXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9lcnBhZG1pbi9iZW5jaC11cnlwb3MvYXBwcy91cnkvVVJZTW9zYWljL3Byb3h5T3B0aW9ucy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9lcnBhZG1pbi9iZW5jaC11cnlwb3MvYXBwcy91cnkvVVJZTW9zYWljL3Byb3h5T3B0aW9ucy5qc1wiO2NvbnN0IGNvbW1vbl9zaXRlX2NvbmZpZyA9IHJlcXVpcmUoJy4uLy4uLy4uL3NpdGVzL2NvbW1vbl9zaXRlX2NvbmZpZy5qc29uJyk7XG5jb25zdCB7IHdlYnNlcnZlcl9wb3J0IH0gPSBjb21tb25fc2l0ZV9jb25maWc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0J14vKGFwcHxhcGl8YXNzZXRzfGZpbGVzKSc6IHtcblx0XHR0YXJnZXQ6IGBodHRwOi8vbG9jYWxob3N0OiR7d2Vic2VydmVyX3BvcnR9YCxcblx0XHR3czogdHJ1ZSxcblx0XHRyb3V0ZXI6IGZ1bmN0aW9uKHJlcSkge1xuXHRcdFx0Y29uc3Qgc2l0ZV9uYW1lID0gcmVxLmhlYWRlcnMuaG9zdC5zcGxpdCgnOicpWzBdO1xuXHRcdFx0cmV0dXJuIGBodHRwOi8vJHtzaXRlX25hbWV9OiR7d2Vic2VydmVyX3BvcnR9YDtcblx0XHR9XG5cdH1cbn07XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUNDLG9CQUFzQjtBQUFBLE1BQ3RCLGNBQWdCO0FBQUEsTUFDaEIsZ0JBQWtCO0FBQUEsTUFDbEIsaUJBQW1CO0FBQUEsTUFDbkIsbUJBQXFCO0FBQUEsTUFDckIsYUFBZTtBQUFBLE1BQ2Ysa0JBQW9CO0FBQUEsTUFDcEIsYUFBZTtBQUFBLE1BQ2Ysa0JBQW9CO0FBQUEsTUFDcEIsaUJBQW1CO0FBQUEsTUFDbkIsZ0JBQWtCO0FBQUEsTUFDbEIsYUFBZTtBQUFBLE1BQ2YsYUFBZTtBQUFBLE1BQ2YsZ0JBQWtCO0FBQUEsTUFDbEIsOEJBQWdDO0FBQUEsTUFDaEMsMkJBQTZCO0FBQUEsTUFDN0Isb0JBQXNCO0FBQUEsTUFDdEIsdUJBQXlCO0FBQUEsTUFDekIsZUFBaUI7QUFBQSxNQUNqQixlQUFpQjtBQUFBLE1BQ2pCLGdCQUFrQjtBQUFBLE1BQ2xCLGdCQUFrQjtBQUFBLElBQ25CO0FBQUE7QUFBQTs7O0FDdkI0VCxPQUFPLFVBQVU7QUFDN1UsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxTQUFTOzs7QUNGOFMsSUFBTSxxQkFBcUI7QUFDelYsSUFBTSxFQUFFLGVBQWUsSUFBSTtBQUUzQixJQUFPLHVCQUFRO0FBQUEsRUFDZCw0QkFBNEI7QUFBQSxJQUMzQixRQUFRLG9CQUFvQixjQUFjO0FBQUEsSUFDMUMsSUFBSTtBQUFBLElBQ0osUUFBUSxTQUFTLEtBQUs7QUFDckIsWUFBTSxZQUFZLElBQUksUUFBUSxLQUFLLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDL0MsYUFBTyxVQUFVLFNBQVMsSUFBSSxjQUFjO0FBQUEsSUFDN0M7QUFBQSxFQUNEO0FBQ0Q7OztBRFpBLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzNCLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFBQSxFQUNmLFFBQVE7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUixPQUFPO0FBQUEsTUFDTixLQUFLLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsSUFDbkM7QUFBQSxFQUNEO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsSUFDYixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJVDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
