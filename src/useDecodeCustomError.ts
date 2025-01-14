import { useState } from "react"
import { decodeErrorResult } from "viem"
import { CustomErrorAbi } from "./CustomErrorAbi"

const useDecodeCustomError = () => {
	const [customError, setCustomError] = useState<null | unknown>(null)

	const decode = (data: `0x${string}`) => {
		const value = decodeErrorResult({
			abi: CustomErrorAbi,
			data,
		})
		setCustomError(value)
	}

	return { decode, customError }
}

export default useDecodeCustomError
