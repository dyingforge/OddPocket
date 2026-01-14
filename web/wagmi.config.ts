import { defineConfig } from '@wagmi/cli'
import { foundry, react } from '@wagmi/cli/plugins'
import { arbitrumSepolia } from 'viem/chains'

export default defineConfig({
  out: 'src/generated.ts',
  contracts: [],
  plugins: [
    foundry({
      project: '../../',
      include: [
        'RedPacket.sol/**',
      ],
      deployments: {
        RedPacket: {
          [arbitrumSepolia.id]: '0x1f2cf075909149640419229f28e3215d65198357',
        },
      },
    }),
    react(),
  ],
})