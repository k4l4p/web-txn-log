import { useState } from "react"
import SelectorList from "./SelectorList"
import useTransactionReceipt from "./useTransactionReceipt"

const App = () => {
	const { txnReceipt, fetch, isLoading, findEntries } = useTransactionReceipt()
	const [tempTxn, setTempTxn] = useState<string>("")
	return (
		<div className="max-w-7xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Transaction Receipt</h1>
			<input
				type="text"
				className="w-full p-2 mb-4"
				placeholder="Enter transaction hash"
				value={tempTxn}
				onChange={(e) => {
					setTempTxn(e.target.value)
				}}
			/>
			<button
				onClick={() => fetch(tempTxn)}
				className="bg-blue-500 text-white px-4 py-2 rounded-md"
			>
				Fetch Transaction
			</button>
			<div className="mt-4">
				<h2 className="text-lg font-bold mb-2">Transaction Receipt</h2>
				<pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[500px]">
					{isLoading ? (
						<p>Loading...</p>
					) : (
						<code id="transaction-receipt" className="text-sm">
							{JSON.stringify(
								txnReceipt,
								(_, value) => {
									if (typeof value === "bigint") {
										return value.toString()
									}
									return value
								},
								2
							)}
						</code>
					)}
				</pre>
			</div>
			{findEntries.length !== 0 ? (
				<div>
					<h2 className="text-lg font-bold mb-2">Key Findings</h2>
					<div className="grid grid-cols-5 gap-2">
						{findEntries.map((entry, idx) => (
							<div key={idx} className="flex flex-col gap-4 p-2 bg-slate-50">
								<p>{entry.key}</p>
								<p className="truncate">{entry.value}</p>
							</div>
						))}
					</div>
				</div>
			) : (
				<></>
			)}

			<div className="mt-4 max-h-[500px] overflow-y-auto">
				<SelectorList />
			</div>
		</div>
	)
}

export default App
