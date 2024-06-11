import { defaultWagmiConfig } from '@web3modal/wagmi/vue'
import { bsc } from "viem/chains";

const metadata = {
    name: 'Web3Modal',
    description: 'Web3Modal Example',
    url: 'https://web3modal.com', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/37784886']
}
const projectId = '8b3fa7c95ab1c2257bfe4a9cd850ca57'
const chains = [bsc] as any
export const config = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
})