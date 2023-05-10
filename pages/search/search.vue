<template>
	<view :class="`content ${$store.getters.themeLive}`">
		<!-- 导航栏 -->
		<NavBar>
			<template #center>
				<!-- <biaofun-datetime-picker
					end="2100"
					start="2000"
					fields="month"
					:defaultValue="curMonth"
					placeholder="请选择开始时间"
					@change="changeDatetimePicker"
				></biaofun-datetime-picker> -->
				<input type="text" placeholder="金额/分类/备注" v-model="searchTxt" @input="filterBill">
			</template>
			<template #right><uni-icons type="settings" size="20" :color="$store.getters.textColorLive" @click="toggle"></uni-icons></template>
		</NavBar>
		
		<!-- 总结余 -->
		<view class="balance" :style="{background: $store.getters.primaryColorLive + ' !important'}">
			<view class="balance-list">
				<view class="balance-item">
					<view class="balance-info">
						<view class="balance-item-title">总结余</view>
						<view class="balance-item-value font-max">￥{{monthIncome - Math.abs(monthOutput)}}</view>
					</view>
				</view>
			</view>
			<view class="balance-list">
				<view class="balance-item">
					<uni-icons type="plus-filled" size="35" color="var(--theme-gray)"></uni-icons>
					<view class="balance-info">
						<view class="balance-item-title">收入</view>
						<view class="balance-item-value">￥{{monthIncome}}</view>
					</view>
				</view>
				<view class="balance-item">
					<uni-icons type="minus-filled" size="35" color="var(--theme-gray)"></uni-icons>
					<view class="balance-info">
						<view class="balance-item-title">支出</view>
						<view class="balance-item-value">￥{{monthOutput}}</view>
					</view>
				</view>
			</view>
		</view>
		
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
					v-for="item in el.list">
					<view class="bill-left">
						<i :class="`iconfont ${item.amountType.icon}`" :style="{'color': item.amountType.color || $store.getters.primaryColorLive}"></i>
						<view class="bill-left-type">
							<view class="bill-type-name">{{item.amountType.name}}</view>
							<view class="bill-type-remark">{{item.remark}}</view>
						</view>
					</view>
					<view class="bill-right">
						<view
							:class="`bill-amount ${item.type == 1 ? '' : 'red'}`"
							:style="{'color': item.type == 1 ? $store.getters.primaryColorLive : ''}"
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
		
		<!-- 侧边栏 -->
		<FilterPop
			ref="FilterPop"
			:endTime.sync="endTime"
			:typeList.sync="typeList"
			:startTime.sync="startTime"
			@change="change"
			@initFilter="initFilter"
		></FilterPop>
	</view>
</template>

<script>
	import dayjs from 'dayjs'
	import NavBar from '@/component/nav-bar/nav-bar.vue'
	import FilterPop from '@/component/filter-pop/index.vue'
	import BiaofunDatetimePicker from '@/component/biaofun-datetime-picker/biaofun-datetime-picker.vue'
	export default {
		components: {
			NavBar,
			FilterPop,
			BiaofunDatetimePicker,
		},
		data() {
			return {
				allBill: [], // 进入页面时，获取所有的账单数据
				billList: [], // 符合条件的账单数据
				searchTxt: '', // 搜索条件
				typeList: [], // 收入/支出 分类
				endTime: dayjs(new Date()).format('YYYY-MM-DD') + ' 23:59', // 结束时间
				startTime: dayjs(new Date().getTime() - (1000 * 60 * 60 * 24 * 30)).format('YYYY-MM-DD') + ' 00:00', // 开始时间
				
				monthIncome: 0, // 收入
				monthOutput: 0, // 支出
				curMonth: dayjs(new Date()).format('YYYY-MM-DD HH:mm'),
				chinesWeek: ['周日','周一','周二','周三','周四','周五','周六'],
				chinseMonths: ['一','二','三','四','五','六','七','八','九','十','十一','十二'],
			}
		},
		async onShow() {
			await this.getData()
			this.filterBill()
		},
		methods: {
			// 返回时间戳
			getTimeStr(v) {
				return new Date(v).getTime()
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
			// 初始化筛选条件
			initFilter (params) {
				const {
					endTime,
					typeList,
					startTime
				} = params
				
				this.endTime = endTime
				this.typeList = typeList
				this.startTime = startTime
				
				this.filterBill()
			},
			// 筛选账单
			filterBill () {
				const that = this
				const curDate = dayjs(that.curMonth).format('YYYY-MM')
				that.monthIncome = 0
				that.monthOutput = 0
				
				const tempList = that.allBill.filter(v => {
					const curTime = that.getTimeStr(v.time)
					const res = (
						// 时间 搜索
						(curTime >= that.getTimeStr(that.startTime) && curTime <= that.getTimeStr(that.endTime)) &&
						// 金额/分类/备注 搜索
						(that.searchTxt ? (
							v.amount.toString().indexOf(that.searchTxt) !== -1 ||
							v.amountType.name.indexOf(that.searchTxt) !== -1 ||
							v.remark.indexOf(that.searchTxt) !== -1
						) : true) &&
						// 收入/支出分类 搜索
						(that.typeList.length ? that.typeList.includes(v.amountType.name) : true)
					)
					return res
				})
				
				// if (tempList.length) {
				// 按照日期排序
				tempList.sort((a,b)=> { return (that.getTimeStr(b.time) - that.getTimeStr(a.time)) })
				tempList.forEach((v) => {
					// 计算总收入和总支出
					if (v.type === 1) that.monthIncome += v.amount
					else that.monthOutput += v.amount
				})
				
				// 按照日期排序
				const dateList = [
					// { date: 'xxxx-xx-xx', daybalance: 0, list: [] }
				]
				tempList.map((v) => {
					const date = dayjs(v.time).format('YYYY-MM-DD')
					const index = dateList.findIndex(el => el.date == date)
					if (index != -1) {
						dateList[index].list.push(v)
						dateList[index].daybalance += v.amount
					} else {
						dateList.push({ date, daybalance: v.amount, list: [v] })
					}
				})
				
				that.billList = dateList
				// }
			},
			formatDate (value, format = 'YYYY-MM-DD') {
				const res = dayjs(value).format(format)
				return res
			},
			toggle() {
				this.$refs.FilterPop.$refs.filterPop.open('right')
			},
			change (e) {
				console.log(e)
			},
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
						color: var(--theme-gray);
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
					color: #999;
				}
				
				.bill-list-daybalance {
					flex: 1;
					font-size: 24rpx;
					color: #999;
					text-align: right;
				}
			}
			
			.bill-item {
				@include flex(space-between);
				width: 100%;
				padding: 30rpx;
				margin-bottom: 10rpx;
				border: 1px solid var(--theme-gray);
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
							color: #999;
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
						color: #999;
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
}

.dark {
	.budget {
		background: rgba($color: #000000, $alpha: 0.3);
	}
}
</style>
