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
          [arbitrumSepolia.id]: '0x62EA36d4aC55BFB842f588bB3251Bb08f8ea9C55',
        },
      },
    }),
    react(),
  ],
})