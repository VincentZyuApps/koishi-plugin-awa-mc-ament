import { Context } from 'koishi'

export interface SearchResult {
  isSucceed: boolean
  msg: string
  res: any
}

export async function getBestFuzzySearchRes(
  ctx: Context,
  backendUrl: string,
  keyword: string
): Promise<SearchResult> {
  try {
    let url = `${backendUrl}/fuzzy_guess`
    const params = new URLSearchParams()
    params.append("keyword", keyword)
    params.append("limit", "20")
    if (params.toString()) url += `?${params.toString()}`
    ctx.logger.info(`🔗 getBestFuzzySearchRes(): url = ${url}`)

    const result = await ctx.http.get(url)
    ctx.logger.info(`📡 ${JSON.stringify(result).slice(0, 100)}`)

    if (result.code !== 200) {
      return {
        isSucceed: false,
        msg: `error: code!==200`,
        res: result
      }
    }

    const data = result.data
    const results = data.results

    if (results.length === 0) {
      return {
        isSucceed: false,
        msg: `results[] is empty`,
        res: null
      }
    } else {
      return {
        isSucceed: true,
        msg: `succeed`,
        res: results[0]
      }
    }
  } catch (e) {
    ctx.logger.error(`❌ error in getBestFuzzySearchRes(): ${e}`)
    return {
      isSucceed: false,
      msg: `error: ${e}`,
      res: null
    }
  }
}
