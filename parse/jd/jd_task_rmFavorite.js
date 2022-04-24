const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东删除商品收藏"
        // this.cron = "12 0,13 * * *"
        this.task = 'local'
        this.readme = "商品关注删除,慎用脚本"
    }

    async prepare() {
        this.dict = this.getData('custom')
    }

    async main(p) {
        let cookie = p.cookie;
        let count = parseInt(this.dict.count || 20)
        for (let i = 0; i<count / 20; i++) {
            let s = await this.curl({
                    'url': `https://m.jingxi.com/fav/comm/FavCommQueryFilter?cp=1&pageSize=20&category=0&promote=0&cutPrice=0&coupon=0&stock=0&_=1650625973463&&sceneval=2&g_login_type=1&callback=aaa`,
                    cookie
                }
            )
            if (this.haskey(s, 'data')) {
                console.log("当前商品收藏数:", s.totalNum)
                if (s.totalNum>0) {
                    // commTitle
                    if (this.dict.whiteList) {
                        let whiteList = this.dict.whiteList.split(",").join('|')
                        var data = s.data.filter(d => !d.commTitle.match(whiteList))
                    }
                    else if (this.dict.blackList) {
                        let blackList = this.dict.blackList.split(",").join('|')
                        var data = s.data.filter(d => d.commTitle.match(blackList))
                    }
                    else {
                        var data = s.data
                    }
                    if (data.length>0) {
                        console.log(`正在删除:`, this.column(data, 'commTitle').join("|"))
                        let rm = await this.curl({
                                'url': `https://api.m.jd.com/api?functionId=batchCancelFavorite&body={"skus":"${this.column(s.data, 'commId').join(",")}"}&appid=follow_for_concert&client=pc`,
                                cookie
                            }
                        )
                        console.log(rm.resultMsg)
                    }
                }
                else {
                    console.log("没有获取关注数据")
                    break
                }
            }
            else {
                console.log("可能黑ip了,没有获取到数据")
            }
        }
    }
}

module.exports = Main;
