import { useState } from "react"
import { createPublicClient, defineChain, http, parseEventLogs } from "viem"
import { eventEmitterAbi } from "./EventEmitterAbi"

export const neoXT4 = defineChain({
	id: 12227332,
	name: "NeoX T4",
	nativeCurrency: {
		decimals: 18,
		name: "GAS",
		symbol: "GAS",
	},
	rpcUrls: {
		default: {
			http: ["https://neoxt4seed1.ngd.network"],
			webSocket: ["wss://neoxt4wss1.ngd.network"],
		},
	},
	blockExplorers: {
		default: { name: "Explorer", url: "https://xt4scan.ngd.network" },
	},
	contracts: {
		multicall3: {
			address: "0x82096F92248dF7afDdef72E545F06e5be0cf0F99",
			blockCreated: 36458,
		},
	},
})

export const neox = defineChain({
	id: 47763,
	name: "NeoX",
	nativeCurrency: { name: "GAS", symbol: "GAS", decimals: 18 },
	rpcUrls: {
		default: {
			http: ["https://mainnet-1.rpc.banelabs.org"],
			webSocket: ["wss://mainnet.wss1.banelabs.org"],
		},
	},
	blockExplorers: {
		default: {
			name: "Arbiscan",
			url: "https://xexplorer.neo.org/",
			apiUrl: "https://xexplorer.neo.org/api",
		},
	},
	contracts: {
		multicall3: {
			address: "0xD6010D102015fEa9cB3a9AbFBB51994c0Fd6E672",
			blockCreated: 4299,
		},
	},
})

const neoxt4Client = createPublicClient({
	transport: http(),
	chain: neoXT4,
})

const neoxClient = createPublicClient({
	transport: http(),
	chain: neox,
})

const chainMap = { neoxClient, neoxt4Client }

export type ChoosableChain = keyof typeof chainMap
export const allChainName: Array<ChoosableChain> = [
	"neoxClient",
	"neoxt4Client",
]

interface UseTransactionReceiptReturn {
	txnReceipt: unknown | null
	fetch: (txn: string) => Promise<void>
	isLoading: boolean
	findEntries: {
		key: string
		value: string
	}[]
}

function isHexPrefix(value: string): value is `0x${string}` {
	return value.startsWith("0x")
}

function useTransactionReceipt(
	chainName: ChoosableChain
): UseTransactionReceiptReturn {
	const client = chainMap[chainName]
	const [txnReceipt, setTxnReceipt] = useState<unknown | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [findEntries, setFindEntries] = useState<
		Array<{
			key: string
			value: string
		}>
	>([])

	const fetch = async (txn: string) => {
		setIsLoading(true)
		setFindEntries([])
		setTxnReceipt(null)
		try {
			if (!isHexPrefix(txn)) {
				throw new Error("Invalid transaction hash")
			}
			const receipt = await client.getTransactionReceipt({
				hash: txn,
			})
			const parsedReceipt = parseEventLogs({
				abi: eventEmitterAbi,
				logs: receipt.logs,
			})
			parsedReceipt.forEach((item) => {
				item?.args?.eventData?.bytesItems?.items?.forEach((bItem) => {
					if (bItem.key === "reasonBytes") {
						setFindEntries((prev) => [...prev, bItem])
					}
				})
				item?.args?.eventData?.stringItems?.items?.forEach((sItem) => {
					if (sItem.key === "reason") {
						setFindEntries((prev) => [...prev, sItem])
					}
				})
			})
			setTxnReceipt(parsedReceipt)
		} catch (error) {
			console.error("Error fetching transaction receipt:", error)
		} finally {
			setIsLoading(false)
		}
	}

	return { txnReceipt, fetch, isLoading, findEntries }
}

export default useTransactionReceipt
