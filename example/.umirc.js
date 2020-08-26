import { defineConfig } from 'umi';

// export default {
//   plugins: [
//     [require.resolve('../lib'), { app: '122', path: '121273', name: '5555' }],
//   ],
// };
export default defineConfig({
  plugins: [
    require.resolve('../lib'),
    [
      require.resolve('../lib'),
      {
        dva: true,
        antd: true,
      },
    ],
  ],
});
