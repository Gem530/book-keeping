<template>
	<view :class="['content', theme]">
		<!-- 导航栏 -->
		<NavBar>
			<template #center>
				<biaofun-datetime-picker
					v-show="yOrM"
					end="2100"
					start="2000"
					fields="month"
					:defaultValue="curMonth"
					placeholder="请选择开始时间"
					@change="changeDatetimePicker"
				></biaofun-datetime-picker>
				<biaofun-datetime-picker
					v-show="!yOrM"
					end="2100"
					start="2000"
					fields="year"
					:defaultValue="curMonth"
					placeholder="请选择开始时间"
					@change="changeDatetimePicker"
				></biaofun-datetime-picker>
			</template>
			<template #right>
				<view class="year-month">
					<view :class="{'year-month-item': true, 'active': yOrM}" @click="chooseYearOrMonth(true)">月</view>
					<view :class="{'year-month-item': true, 'active': !yOrM}" @click="chooseYearOrMonth(false)">年</view>
				</view>
			</template>
		</NavBar>
		
		<!-- 收入/支出 -->
		<view class="balance">
			<view :class="{'balance-item': true, 'balance-item-active': type == 'income'}" @click="chooseType('income')">
				<view class="balance-item-text">总收入</view>
				<view class="balance-item-value">￥{{monthIncome}}</view>
			</view>
			<view :class="{'balance-item': true, 'balance-item-active': type == 'output'}" @click="chooseType('output')">
				<view class="balance-item-text">总支出</view>
				<view class="balance-item-value">￥{{monthOutput}}</view>
			</view>
		</view>
		
		<!-- 结余/总笔数/日均额 -->
		<view class="params-list">
			<view class="params-item">
				<view class="params-item-text">结余</view>
				<view class="params-item-value">￥{{monthIncome - Math.abs(monthOutput)}}</view>
			</view>
			<view class="params-item">
				<view class="params-item-text">总笔数</view>
				<view class="params-item-value">{{billList.length}}</view>
			</view>
			<view class="params-item">
				<view class="params-item-text">日均额</view>
				<view class="params-item-value">￥{{average}}</view>
			</view>
		</view>
		
		<!-- 折线图 -->
		<LineChart v-if="lineOption" id="lineChart" :options="lineOption"></LineChart>
		<!-- 饼状图 -->
		<PieChart v-if="pieOption" id="pieChart" :options="pieOption" height="600rpx"></PieChart>
		
		<!-- 分类总笔数 -->
		<view class="bill" v-if="pieList.length">
			<view
				:key="item.id"
				class="bill-item"
				v-for="item in pieList">
				<view class="bill-left">
					<i :class="['iconfont', item.amountType.icon]" :style="{'color': item.amountType.color || primaryTheme}"></i>
					<view class="bill-left-type">
						<view class="bill-type-name">{{item.name}} <text class="bill-type-per">{{getCurPer(item.value)}}%</text></view>
						<!-- <view class="bill-type-remark">{{item.remark}}</view> -->
						<view class="bill-type-progress">
							<view class="bill-type-progress-bar" :style="{width: getCurPer(item.value)+'%', background: item.amountType.color || primaryTheme + ' !important'}"></view>
						</view>
					</view>
				</view>
				<view class="bill-right">
					<view
						:class="['bill-amount', item.type == 1 ? '' : 'red']"
						:style="{'color': item.type == 1 ? primaryTheme : ''}"
					>￥{{item.value}}</view>
					<view class="bill-time">{{item.num}}笔</view>
				</view>
			</view>
		</view>
		
		<!-- 日账单统计 -->
		<view class="statistics" v-if="dayStatistics.length">
			<view class="statistics-title">{{this.yOrM ? '日' : '月'}}账单统计</view>
			
			<div class="statistics-head">
				<div class="statistics-head-item time">日期</div>
				<div class="statistics-head-item">收入</div>
				<div class="statistics-head-item">支出</div>
				<div class="statistics-head-item">结余</div>
			</div>
			<div
				:key="item.id"
				class="statistics-body"
				v-for="item in dayStatistics">
				<div class="statistics-body-item time">{{formatDate(item.time, yOrM ? 'MM-DD' : 'YYYY-MM')}}</div>
				<div class="statistics-body-item">{{item.income ? '￥'+item.income : '-'}}</div>
				<div class="statistics-body-item">{{item.output ? '￥'+item.output : '-'}}</div>
				<div class="statistics-body-item">￥{{item.income - Math.abs(item.output)}}</div>
			</div>
		</view>
		
		<!-- 排行榜 -->
		<view class="bill" v-if="billList.length">
			<view class="bill-title">{{type == 'income' ? '收入' : '支出'}}排行榜</view>
			<view
				:key="item.id"
				class="bill-item"
				v-for="item in billList.slice(0, 20)">
				<view class="bill-left">
					<i :class="['iconfont', item.amountType.icon]" :style="{'color': item.amountType.color || primaryTheme}"></i>
					<view class="bill-left-type">
						<view class="bill-type-name">{{item.amountType.name}}</text></view>
						<view class="bill-type-remark">{{item.remark}}</view>
					</view>
				</view>
				<view class="bill-right">
					<view
						:class="['bill-amount',  item.type == 1 ? '' : 'red']"
						:style="{'color': item.type == 1 ? primaryTheme : ''}"
					>￥{{item.amount}}</view>
					<view class="bill-time">{{item.time}}</view>
				</view>
			</view>
		</view>
		
	</view>
</template>

<script>
	import dayjs from 'dayjs'
	import NavBar from '@/component/nav-bar/nav-bar.vue'
	import LineChart from '../../components/echart/echart.vue'
	import PieChart from '../../components/echart/pie-echart.vue'
	import BiaofunDatetimePicker from '@/component/biaofun-datetime-picker/biaofun-datetime-picker.vue'
	export default {
		name: 'statistics',
		components: {
			NavBar,
			PieChart,
			LineChart,
			BiaofunDatetimePicker,
		},
		computed: {
			theme () {
				return this.$store.getters.themeLive
			},
			primaryTheme () {
				return this.$store.getters.primaryColorLive
			},
		},
		data() {
			return {
				type: 'output', // 类型 收入/支出
				yOrM: true, // true 为月份 false 为年份
				average: 0, // 日均额
				allBill: [], // 所有账单信息
				billList: [], // 当前类型的账单
				monthIncome: 0, // 总收入
				monthOutput: 0, // 总支出
				dayStatistics: [], // 日账单统计
				curMonth: dayjs(new Date()).format('YYYY-MM-DD HH:mm'), // 当前选择时间
				
				// echarts数据
				pieList: [],
				dateList: [],
				valueList: [],
				pieOption: undefined,
				lineOption: undefined,
			}
		},
		async onLoad(option) {
			// console.log(option)
			this.type = option.type
			await this.getData()
			this.initBill()
		},
		methods: {
			chooseYearOrMonth (v) {
				this.yOrM = v
				this.initBill()
			},
			// 返回时间戳
			getTimeStr(v) {
				return new Date(v).getTime()
			},
			formatDate (value, format) {
				const res = dayjs(value).format(format || 'YYYY-MM-DD')
				return res
			},
			getData () {
				return new Promise((resolve, reject) => {
					const that = this
					uni.getStorageInfo({
						success(res) {
							const keys = res.keys.filter(v => v.includes('bill:'))
							let list = []
							for (let i = 0; i < keys.length; i++) {
								const data = JSON.parse(uni.getStorageSync(keys[i]))
								list = list.concat(data.list)
							}
							list.sort((a,b)=> { return (that.getTimeStr(b.time) - that.getTimeStr(a.time)) })
							that.allBill = list
							resolve(true)
						},
						fail() {
							reject(false)
						}
					})
				})
			},
			initBill () {
				const that = this
				const curDate = dayjs(that.curMonth).format(this.yOrM ? 'YYYY-MM' : 'YYYY')
				that.monthIncome = 0
				that.monthOutput = 0
				that.pieList = []
				that.dateList = []
				that.valueList = []
				
				let tempList = that.allBill.filter(v => {
					const curTime = that.getTimeStr(v.time)
					const res = (
						// 时间 搜索
						v.time.includes(curDate)
					)
					return res
				})
				
				// 日账单统计
				let dayList = [
					// { time: 'xxxx-xx-xx', income: 0, output: 0 }
				]
				
				// if (tempList.length) {
				// // 按照日期排序
				// tempList.sort((a,b)=> { return (that.getTimeStr(b.time) - that.getTimeStr(a.time)) })
				// // 按照金额大小排序
				tempList.sort((a,b)=> { return Math.abs(b.amount) - Math.abs(a.amount) })
				tempList.forEach((v) => {
					// 计算总收入和总支出
					if (v.type === 1) that.monthIncome += v.amount
					else that.monthOutput += v.amount
					
					const index = dayList.findIndex(el => that.formatDate(el.time, that.yOrM ? '' : 'YYYY-MM') == that.formatDate(v.time, that.yOrM ? '' : 'YYYY-MM'))
					if (index !== -1) {
						dayList[index][v.type == 1 ? 'income' : 'output'] += v.amount
					} else {
						dayList.push({
							time: that.formatDate(v.time,  that.yOrM ? '' : 'YYYY-MM'),
							income: v.type == 1 ? v.amount : 0,
							output: v.type == 1 ? 0 : v.amount,
						})
					}
				})
				
				// 日期排序
				dayList.sort((a, b) => { return (that.getTimeStr(b.time) - that.getTimeStr(a.time)) })
				this.dayStatistics = dayList
				
				const type = that.type == 'income' ? 1 : 2
				tempList = tempList.filter(v => v.type == type)
				
				const tempTime = tempList.length ? tempList[0].time : that.curMonth
				const day = dayjs(tempTime).format('D')
				that.average = (Math.abs(that.type == 'income' ? (that.monthIncome / day) : (that.monthOutput / day))).toFixed(2)
				
				// 折线图
				if (this.yOrM) {
					const curMonth = dayjs(tempTime).format('YYYY-MM')
					const days = that.getCurMonthDay(curMonth)
					for (let i = 1; i <= days; i++) {
						const curDay = curMonth + '-' + (i < 10 ? ('0' + i) : i)
						that.dateList.push(curDay)
						that.valueList.push(0)
						tempList.forEach((v) => {
							if (dayjs(v.time).format('YYYY-MM-DD') == curDay) {
								if (that.valueList[i - 1]) {
									that.valueList.splice(i - 1, 1, Math.abs(v.amount) + that.valueList[i - 1])
								} else {
									that.valueList.splice(i - 1, 1, Math.abs(v.amount))
								}
							}
						})
					}
					that.initLine()
				} else {
					const curYear = dayjs(tempTime).format('YYYY')
					for (let i = 1; i <= 12; i++) {
						const curMonth = curYear + '-' + (i < 10 ? ('0' + i) : i)
						that.dateList.push(curMonth)
						that.valueList.push(0)
						tempList.forEach((v) => {
							if (dayjs(v.time).format('YYYY-MM') == curMonth) {
								if (that.valueList[i - 1]) {
									that.valueList.splice(i - 1, 1, Math.abs(v.amount) + that.valueList[i - 1])
								} else {
									that.valueList.splice(i - 1, 1, Math.abs(v.amount))
								}
							}
						})
					}
					that.initLine()
				}
				
				// 饼状图
				const pies = [
					// { value: 0, name: '餐饮' }
				]
				tempList.map((v) => {
					const index = pies.findIndex(el => el.name == v.amountType.name)
					if (index != -1) {
						pies[index].value += Math.abs(v.amount)
						pies[index].num += 1
					} else {
						pies.push({
							value: Math.abs(v.amount),
							name: v.amountType.name,
							amountType: v.amountType,
							num: 1
						})
					}
				})
				pies.sort((a,b)=> { return b.value - a.value })
				this.pieList = pies
				this.initPie()
				
				that.billList = tempList
				// console.log(that.billList)
				// }
			},
			// 获取当前分类总占比
			getCurPer (val) {
				return (val / (this.type == 'income' ? this.monthIncome : Math.abs(this.monthOutput)) * 100).toFixed(2)
			},
			// 获取当前月份天数  传入格式'2023-05'
			getCurMonthDay (month) {
				let date = new Date(month + '-01')
				date.setMonth(date.getMonth() + 1) // 先设置为下个月
				date.setDate(0) // 再置0，变成当前月最后一天
				return date.getDate() // 当前月最后一天，即当前月拥有的天数
			},
			changeDatetimePicker (date) {
				this.curMonth = `${date.YYYY}-${date.MM}-${date.DD} ${date.hh}:${date.mm}`
				this.initBill()
			},
			chooseType (val) {
				this.type = val
				this.initBill()
			},
			// 折线图初始化值
			initLine () {
				const that = this
				that.lineOption = {
					tooltip: {
						trigger: 'axis',
						formatter: `{b}\n￥{c}`,
						backgroundColor: '#ddd',
						position: (point, params, el, elRect, size) => {
							let x = point[0] - (size.contentSize[0] / 2)
							return [x, 0];
						}
					},
					xAxis: {
						type: 'category',
						axisLine: {
							lineStyle: {
								color: that.$store.getters.textColorLive,
							}
						},
						axisLabel: {
							color: that.$store.getters.textColorLive,
							formatter: (value, index) => {
								// console.log(value, index)
								return dayjs(value).format(this.yOrM ? 'DD' : 'MM')
							},
						},
						data: that.dateList
					},
					yAxis: {
						type: 'value',
						axisLine: {
							lineStyle: {
								color: that.$store.getters.textColorLive,
							}
						},
						axisLabel: {
							color: that.$store.getters.textColorLive
						},
					},
					series: [
						{
							data: that.valueList,
							type: 'line',
							smooth: true
						}
					]
				}
			},
			// 饼状图
			initPie () {
				const that = this
				that.pieOption = {
					title: {
						text: that.type == 'income' ? '收入' : '支出',
						top: 'center',
						left: 'center',
						textStyle: {
							color: that.$store.getters.textColorLive
						}
					},
					tooltip: {
						trigger: 'item',
						backgroundColor: '#ddd',
					},
					legend: {
						top: '0',
						left: '0',
						textStyle: {
							color: that.$store.getters.textColorLive
						}
					},
					series: [
						{
							name: that.type == 'income' ? '收入' : '支出',
							type: 'pie',
							radius: ['30%', '50%'],
							avoidLabelOverlap: false,
							itemStyle: {
								borderRadius: 10,
								borderColor: '#fff',
								borderWidth: 2
							},
							label: {
								show: true,
								formatter(param) {
									return param.name + '\n' + param.percent + '%';
								}
							},
							data: that.pieList
						}
					]
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	min-height: 100vh;
	padding: 30rpx;
	// background: var(--theme-body-bg);
	
	.year-month {
		@include flex();
		width: 150rpx;
		height: 55rpx;
		background: #eee;
		border-radius: 55rpx;
		
		.year-month-item {
			flex: 1;
			@include flex();
			height: 100%;
			text-align: center;
			
			&.active {
				background: #ddd;
				border-radius: 55rpx;
			}
		}
	}
	
	.balance {
		@include flex(space-around);
		width: 100%;
		
		.balance-item {
			@include flex(center, center, column);
			flex: none;
			width: 40%;
			height: 150rpx;
			border-radius: 20rpx;
			
			&.balance-item-active {
				background: #ddd;
			}
			
			.balance-item-text {
				font-size: 24rpx;
				color: #999;
			}
			.balance-item-value {
				margin-top: 10rpx;
				font-size: 46rpx;
				font-weight: 600;
			}
		}
	}
	
	.params-list {
		@include flex(space-around);
		width: 100%;
		height: 90rpx;
		margin-top: 30rpx;
		
		.params-item {
			position: relative;
			@include flex(center, center, column);
			flex: 1;
			height: 100%;
			
			&:not(:last-child) {
				&::after {
					content: "";
					position: absolute;
					top: 0;
					right: 0;
					height: 100%;
					border-right: 1rpx solid #ddd;
				}
			}
			
			.params-item-text {
				font-size: 24rpx;
				color: #999;
			}
			.params-item-value {
				margin-top: 10rpx;
				font-size: 36rpx;
				font-weight: 500;
			}
		}
	}
	
	.statistics {
		width: 710rpx;
		margin-top: 20rpx;
		text-align: center;
		
		.statistics-title {
			margin-bottom: 20rpx;
			font-size: 28rpx;
			color: #ddd;
		}
		
		.statistics-head {
			@include flex(space-between);
			font-size: 26rpx;
			
			.statistics-head-item {
				flex: 1;
				@include flex();
				height: 45rpx;
				
				&.time {
					flex: none;
					width: 120rpx;
				}
			}
		}
		
		.statistics-body {
			@include flex(space-between);
			margin-top: 6rpx;
			border: 1rpx solid #ddd;
			font-size: 24rpx;
			font-weight: 600;
			border-radius: 8rpx;
			
			.statistics-body-item {
				flex: 1;
				@include flex();
				height: 55rpx;
				
				&.time {
					flex: none;
					width: 120rpx;
					background: #ddd;
					border-radius: 5rpx;
				}
			}
		}
	}
	
	.bill {
		width: 710rpx;
		margin-top: 20rpx;
		
		.bill-title {
			margin-bottom: 20rpx;
			font-size: 28rpx;
			color: #ddd;
			text-align: center;
		}
			
		.bill-item {
			@include flex(space-between);
			width: 100%;
			padding: 30rpx;
			margin-bottom: 10rpx;
			border: 1px solid #ddd;
			border-radius: 10rpx;
			
			.bill-left {
				@include flex(flex-start);
				flex: 1;
				
				.iconfont {
					margin-right: 5rpx;
					font-size: 60rpx;
				}
				
				.bill-left-type {
					flex: 1;
					.bill-type-name {
						font-size: 32rpx;
						
						.bill-type-per {
							margin-left: 10rpx;
							font-size: 24rpx;
						}
					}
					
					.bill-type-remark {
						font-size: 24rpx;
						color: #ddd;
					}
					
					.bill-type-progress {
						position: relative;
						width: 100%;
						height: 10rpx;
						margin-top: 15rpx;
						border-radius: 10rpx;
						background: #ddd;
						
						.bill-type-progress-bar {
							position: absolute;
							top: 0;
							left: 0;
							height: 100%;
							border-radius: 10rpx;
						}
					}
				}
			}
			.bill-right {
				width: 210rpx;
				text-align: right;
				
				.bill-amount {
					font-size: 32rpx;
					
					// &.red {
					// 	color: orangered;
					// }
				}
				.bill-time {
					font-size: 24rpx;
					color: #ddd;
				}
			}
		}
	}
	
}
</style>
