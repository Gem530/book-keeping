<template>
	<view :class="['content', theme]">
		<!-- 导航栏 -->
		<NavBar>
			<template #left><uni-icons type="bars" size="20" @click="toggle" :color="colorTheme"></uni-icons></template>
			<template #center>
				<biaofun-datetime-picker
					end="2100"
					start="2000"
					fields="month"
					:defaultValue="curMonth"
					placeholder="请选择开始时间"
					@change="changeDatetimePicker"
				></biaofun-datetime-picker>
			</template>
			<template #right><uni-icons type="search" size="20" :color="colorTheme" @click="toPath('/pages/search/search')"></uni-icons></template>
		</NavBar>
		
		<!-- 总结余 -->
		<view class="balance" :style="{background: primaryTheme + ' !important'}">
			<view class="balance-list">
				<view class="balance-item">
					<view class="balance-info">
						<view class="balance-item-title">总结余</view>
						<view class="balance-item-value font-max">￥{{(Number(monthIncome - Math.abs(monthOutput)) * 100 / 100).toFixed(2)}}</view>
					</view>
				</view>
			</view>
			<view class="balance-list">
				<view class="balance-item" @click="toPath('/pageSub/pages/statistics/statistics?type=income')">
					<uni-icons type="plus-filled" size="35" color="#ddd"></uni-icons>
					<view class="balance-info">
						<view class="balance-item-title">月收入</view>
						<view class="balance-item-value">￥{{monthIncome}}</view>
					</view>
				</view>
				<view class="balance-item" @click="toPath('/pageSub/pages/statistics/statistics?type=output')">
					<uni-icons type="minus-filled" size="35" color="#ddd"></uni-icons>
					<view class="balance-info">
						<view class="balance-item-title">月支出</view>
						<view class="balance-item-value">￥{{monthOutput}}</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 月预算 -->
		<view :class="['budget', theme]" v-if="buget">
			<view class="budget-flex">
				<view class="budget-tip">月预算</view>
				<view class="budget-value">剩余:￥{{buget - Math.abs(monthOutput)}} &nbsp;&nbsp; 预算:￥{{buget}}</view>
			</view>
			<view class="budget-progress">
				<view class="budget-progress-bar" :style="{width: progressWidth, background: primaryTheme + ' !important'}"></view>
			</view>
		</view>
		
		<!-- 获取数据 -->
		<button @click="initBill">获取当月数据</button>
		
		<!-- 账单列表 -->
		<view class="bill" v-if="billList.length">
			<view
				:key="el.id"
				 class="bill-list-item"
				v-for="el in billList">
				<view class="bill-list-item-title">
					{{formatDate(el.date, 'MM/DD')}}
					<text class="bill-list-week">{{chinesWeek[formatDate(el.date, 'd')]}}</text>
					<text class="bill-list-daybalance">￥{{el.daybalance}}</text>
				</view>
				<view
					:key="item.id"
					class="bill-item"
					v-for="item in el.list"
					@click="() => delBill(item)">
					<view class="bill-left">
						<i :class="['iconfont', item.amountType.icon]" :style="{'color': item.amountType.color || primaryTheme}"></i>
						<view class="bill-left-type">
							<view class="bill-type-name">{{item.amountType.name}}</view>
							<view class="bill-type-remark">{{item.remark}}</view>
						</view>
					</view>
					<view class="bill-right">
						<view
							:class="['bill-amount', item.type == 1 ? '' : 'red']"
							:style="{'color': item.type == 1 ? primaryTheme : ''}"
						>￥{{item.amount}}</view>
						<view class="bill-time">{{item.time}}</view>
					</view>
				</view>
			</view>
		</view>
		<view class="bill-empty" v-else>
			<view class="bill-empty-month">{{chinseMonths[formatDate(curMonth, 'M') - 1]}}月</view>
			<view class="bill-empty-text">无账单，快去记录你的账单吧~</view>
		</view>
		
		<!-- <button @click="delAgainData">删除重复数据</button> -->
		
		<!-- 去登录-->
		<uni-icons class="to-login" type="contact-filled" size="50" :color="primaryTheme" @click="toPath('/pages/login/index')"></uni-icons>
		<!-- 悬浮图标  -->
		<uni-icons class="fixed-icon" type="plus-filled" size="50" :color="primaryTheme" @click="toPath('/pages/add-bill/add-bill')"></uni-icons>
		
		<!-- 侧边栏 -->
		<Sider ref="sider" :curMonth="curMonth" @change="change" @initBuget="initBuget"></Sider>
	</view>
</template>

<script>
	import dayjs from 'dayjs'
	import Sider from '@/component/sider/index.vue'
	import NavBar from '@/component/nav-bar/nav-bar.vue'
	import BiaofunDatetimePicker from '@/component/biaofun-datetime-picker/biaofun-datetime-picker.vue'
	export default {
		components: {
			Sider,
			NavBar,
			BiaofunDatetimePicker,
		},
		data() {
			return {
				db: uniCloud.database(),
				buget: 0,
				endTime: undefined,
				billList: [],
				startTime: undefined,
				monthIncome: 0,
				monthOutput: 0,
				curMonth: dayjs(new Date()).format('YYYY-MM-DD HH:mm'),
				chinesWeek: ['周日','周一','周二','周三','周四','周五','周六'],
				chinseMonths: ['一','二','三','四','五','六','七','八','九','十','十一','十二'],
			}
		},
		computed: {
			progressWidth () {
				let bugetBalance = this.buget - Math.abs(this.monthOutput)
				bugetBalance = bugetBalance < 0 ? 0 : bugetBalance
				const res = (bugetBalance / this.buget) * 100
				return res + '%'
			},
			id () {
				return this.$store.getters.idLive
			},
			theme () {
				return this.$store.getters.themeLive
			},
			colorTheme () {
				return this.$store.getters.textColorLive
			},
			primaryTheme () {
				return this.$store.getters.primaryColorLive
			},
		},
		onShow() {
			// this.getData()
			uni.getStorage({
				key: 'token',
				success(res) {
					if (!res.data) {
						// 未登录
						uni.navigateTo({ url:'/pages/login/index' })
					}
				},
				fail() {
					// 未登录
					uni.navigateTo({ url:'/pages/login/index' })
				}
			})
			this.initBuget()
		},
		methods: {
			// getData () {
			// 	uni.getStorageInfo({
			// 		success(res) {
			// 			console.log(res)
			// 		}
			// 	})
			// },
			delAgainData () {
				this.db.collection('bill').where({
					createTime: 1692751769721
				}).remove().then(res => {
					// console.log(res)
					uni.showToast({title: '删除成功'})
				}).catch((err) => {
					console.log(err)
				})
			},
			getMonthDay(year, month) {
			  let days = new Date(year, Number(month), 0).getDate()
			  return days
			},
			initBuget () {
				const that = this
				this.db.collection('buget').where({
					userId: this.id,
					time: that.db.command.gte(that.startTime)
						.and(that.db.command.lte(that.endTime))
				}).get().then(res => {
					// console.log(res)
					that.buget = res.result.data.length ? res.result.data[0].buget : 0
				})
			},
			initBill () {
				const that = this
				const curDate = dayjs(that.curMonth).format('YYYY-MM')
				// console.log(curDate)
				const yAndM = curDate.toString().split('-')
				let endDate = that.getMonthDay(yAndM[0], yAndM[1])
				endDate = endDate < 10 ? '0' + endDate: endDate
				that.startTime = new Date(curDate+'-01 00:00:00').getTime()
				that.endTime = new Date(curDate+'-'+endDate+' 23:59:59').getTime()
				that.monthIncome = 0
				that.monthOutput = 0
				
				// console.log(startTime, endTime)
				that.db.collection('bill').where({
					userId: that.id,
					time: that.db.command.gte(that.startTime)
						.and(that.db.command.lte(that.endTime))
				})
				.orderBy('time', 'desc') // 1字段排序的字段 2字段排序的顺序，升序(asc) 或 降序(desc)
				.get().then((res) => {
					const data = res.result.data
					that.billList = []
					const tempList = data
					// console.log(data)
					
					// 按照日期排序
					const dateList = [
						// { date: 'xxxx-xx-xx', daybalance: 0, list: [] }
					]
					if (!data.length) return
					tempList.map(v => {
						// 计算总收入和总支出
						if (v.type === 1) that.monthIncome += Number(v.amount)
						else that.monthOutput += Number(v.amount)
						
						v.time = dayjs(v.time).format('YYYY-MM-DD HH:mm')
						const date = dayjs(v.time).format('YYYY-MM-DD')
						const index = dateList.findIndex(el => el.date == date)
						if (index != -1) {
							dateList[index].list.push(v)
							dateList[index].daybalance += Number(v.amount)
							dateList[index].daybalance = (dateList[index].daybalance * 100) / 100
						} else {
							dateList.push({ date, daybalance: Number(v.amount) * 100 / 100, list: [v] })
						}
					})
					that.monthIncome = (that.monthIncome * 100) / 100
					that.monthOutput = (that.monthOutput * 100) / 100
					that.billList = dateList
					// console.log(data, that.billList)
				})
				
				// uni.getStorage({
				// 	key: 'bill:' + curDate,
				// 	success(res) {
				// 		const data = JSON.parse(res.data)
				// 		that.buget = data.buget || 0
						
				// 		const tempList = data.list || []
				// 		if (tempList.length) {
				// 			// 按照日期排序
				// 			tempList.sort((a,b)=> { return (new Date(b.time).getTime() - new Date(a.time).getTime()) })
				// 			tempList.forEach((v) => {
				// 				// 计算总收入和总支出
				// 				if (v.type === 1) that.monthIncome += Number(v.amount)
				// 				else that.monthOutput += Number(v.amount)
				// 			})
				// 			that.monthIncome = (that.monthIncome * 100) / 100
				// 			that.monthOutput = (that.monthOutput * 100) / 100
							
				// 			// 按照日期排序
				// 			const dateList = [
				// 				// { date: 'xxxx-xx-xx', daybalance: 0, list: [] }
				// 			]
				// 			tempList.map((v) => {
				// 				const date = dayjs(v.time).format('YYYY-MM-DD')
				// 				const index = dateList.findIndex(el => el.date == date)
				// 				if (index != -1) {
				// 					dateList[index].list.push(v)
				// 					dateList[index].daybalance += v.amount
				// 					dateList[index].daybalance = (dateList[index].daybalance * 100) / 100
				// 				} else {
				// 					dateList.push({ date, daybalance: v.amount, list: [v] })
				// 				}
				// 			})
							
				// 			that.billList = dateList
				// 		}
				// 	},
				// 	fail() {
				// 		that.buget = 0
				// 		that.billList = []
				// 		that.monthIncome = 0
				// 		that.monthOutput = 0
				// 	}
				// })
			},
			changeDatetimePicker (date) {
				this.curMonth = `${date.YYYY}-${date.MM}-${date.DD} ${date.hh}:${date.mm}`
				this.initBuget()
			},
			formatDate (value, format) {
				const res = dayjs(value).format(format)
				return res
			},
			toggle() {
				this.$refs.sider.$refs.popup.open('left')
			},
			change (e) {
				console.log(e)
			},
			toPath (v) {
				uni.navigateTo({url: v})
			},
			delBill (v) {
				const that = this
				// console.log(v)
				
				// // console.log(startTime, endTime)
				uni.showModal({
					title: '提示',
					content: '确认删除当前账单吗？',
					success(res) {
						if (res?.confirm) {
							that.db.collection('bill').where({
								_id: v._id
							}).remove().then(() => {
								uni.showToast({title: '删除成功'})
							}).catch((err) => {
								console.log(err)
								uni.showToast({icon:'error',title: '删除失败'})
							})
						}
					}
				})
				// uni.showModal({
				// 	title: '提示',
				// 	content: '确认删除当前账单吗？',
				// 	success(res) {
				// 		if (res?.confirm) {
				// 			const storgeKey = 'bill:' + dayjs(v.time).format('YYYY-MM')
				// 			let resData = null
				// 			uni.getStorage({
				// 				key: storgeKey,
				// 				success(res) {
				// 					const data = JSON.parse(res.data)
				// 					const index = data.list.findIndex(el => el.createdTime == v.createdTime && el.amount == v.amount)
				// 					data.list.splice(index, 1)
				// 					console.log(data)
									
				// 					uni.setStorage({
				// 						key: storgeKey,
				// 						data: JSON.stringify(data),
				// 						success() {
				// 							uni.showToast({title: '删除成功'})
				// 						},
				// 						fail() {
				// 							uni.showToast({title: '删除失败'})
				// 						}
				// 					})
				// 				},
				// 				fail() {
				// 					uni.showToast({title: '删除失败'})
				// 				}
				// 			})
				// 		}
				// 	}
				// })
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
	padding: 0 0 30rpx;
	// background: var(--theme-body-bg);
	
	.balance {
		width: 710rpx;
		padding: 30rpx;
		margin: 20rpx 0;
		color: #ffffff;
		border-radius: 15rpx;
		
		.balance-list {
			@include flex(flex-start);
			
			&:not(:last-child) {
				margin-bottom: 30rpx;
			}
			
			.balance-item {
				@include flex(flex-start);
				flex: 1;
				
				.uni-icons {
					margin-right: 5rpx;
				}
				
				.balance-info {
					.balance-item-title {
						margin-bottom: 10rpx;
						font-size: 24rpx;
						color: #ddd;
					}
					
					.balance-item-value {
						font-size: 26rpx;
						
						&.font-max {
							font-size: 38rpx;
						}
					}
				}
			}
		}
	}
	
	.budget {
		width: 710rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		// background: var(--theme-body-bg);
		border-radius: 10rpx;
		box-shadow: 0 0 6rpx rgba($color: #000000, $alpha: 0.3);
		
		.budget-flex {
			@include flex(space-between);
			font-size: 24rpx;
			// color: var(--theme-text-color);
		}
		.budget-progress {
			position: relative;
			width: 100%;
			height: 20rpx;
			background: #ddd;
			margin-top: 20rpx;
			border-radius: 20rpx;
			
			.budget-progress-bar {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				border-radius: 20rpx;
			}
		}
	}
	
	.bill {
		width: 710rpx;
		
		.bill-list-item {
			margin-top: 20rpx;
			
			.bill-list-item-title {
				@include flex(flex-start, flex-end);
				padding: 10rpx 5rpx;
				font-size: 32rpx;
				font-weight: 600;
				letter-spacing: 2rpx;
				
				.bill-list-week {
					padding-left: 20rpx;
					font-size: 24rpx;
					color: #ddd;
				}
				
				.bill-list-daybalance {
					flex: 1;
					font-size: 24rpx;
					color: #ddd;
					text-align: right;
				}
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
						}
						.bill-type-remark {
							font-size: 24rpx;
							color: #ddd;
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
	
	.bill-empty {
		padding-top: 120rpx;
		text-align: center;
		color: #dfd9d9;
		.bill-empty-month {
			font-size: 70rpx;
			font-weight: 600;
		}
		.bill-empty-text {
			margin-top: 40rpx;
			font-size: 24rpx;
		}
	}
	
	.fixed-icon {
		position: fixed;
		right: 30rpx;
		bottom: 30rpx;
		z-index: 2;
	}
	
	.to-login {
		position: fixed;
		right: 30rpx;
		bottom: 130rpx;
		z-index: 2;
	}
}

.dark {
	.budget {
		background: rgba($color: #000000, $alpha: 0.3);
	}
}
</style>
