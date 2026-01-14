import { defineConfig } from '@wagmi/cli'
import { foundry, react } from '@wagmi/cli/plugins'
import { arbitrumSepolia } from 'viem/chains'

export default defineConfig({
  out: 'src/generated.ts',
  contracts: [],
  plugins: [
    foundry({
      project: '../',
      include: [
        'RedPacket.sol/**',
      ],
      deployments: {
        RedPacket: {
          [arbitrumSepolia.id]: '0x9ada12453663fd9b2d4d55986b519c9a558f5a95',
        },
      },
    }),
    react(),
  ],
})