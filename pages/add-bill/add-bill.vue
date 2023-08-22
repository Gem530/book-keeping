<template>
	<view :class="['add-bill', theme]">
	<!-- <view :class=""> -->
		<!-- 导航栏 -->
		<NavBar>
			<template #center>
				<view class="tab">
					<view
						:key="item.id"
						:class="{
							'tab-item': true,
							'tab-active': item.id == tabIndex
						}"
						v-for="item in tabList"
						@click="changeTab(item)"
						:style="{color: item.id == tabIndex ? (primaryTheme + ' !important') : ''}">
						{{item.name}}
						<view class="tab-active-border" :style="{background: primaryTheme + ' !important'}"></view>
					</view>
				</view>
			</template>
			<template #right>
				<biaofun-datetime-picker
					end="2100"
					start="2000"
					fields="minute"
					placeholder="请选择时间"
					:defaultValue="curMonth"
					@change="changeDatetimePicker">
					<template #default="{date}">
					{{formatDate(date, 'MM/DD')}}
					</template>
				</biaofun-datetime-picker>
			</template>
		</NavBar>
		
		<!-- 金额输入框 -->
		<view class="amount-box">
			<view class="amount-type">
				<i :class="['iconfont', currentAmountType.icon]" :style="{'color': currentAmountType.color || primaryTheme}"></i>
				<text class="amount-text">{{currentAmountType.name}}</text>
			</view>
			<input type="number" class="amount-input" v-model:number.trim="amount" @keyup="mustNumber" focus>
		</view>
		<view class="amount-box margin-top">
			<view class="amount-type">
				<i class="iconfont icon-biaoqian_qiangxianjiuyuan" :style="{'color': primaryTheme}"></i>
				<text class="amount-text">备注</text>
			</view>
			<input type="text" class="amount-input" placeholder="请输入备注" v-model="remark">
		</view>
		
		<view class="bill-type">
			<view
				:key="item.icon"
				:class="{
					'bill-type-item': true,
					'bill-type-item-acitve': item.icon === currentAmountType.icon
				}"
				v-for="item in currentAmountList"
				@click="changeBillType(item)">
				<i :class="['iconfont', item.icon]" :style="{'color': item.color || primaryTheme}"></i>
				<view class="bill-type-name">{{item.name}}</view>
			</view>
		</view>
		
		<button class="add-bill-btn" :style="{background: primaryTheme + ' !important'}" @click="addBill">保存</button>
	</view>
</template>

<script>
	import dayjs from 'dayjs'
	import NavBar from '@/component/nav-bar/nav-bar.vue'
	import BiaofunDatetimePicker from '@/component/biaofun-datetime-picker/biaofun-datetime-picker.vue'
	export default {
		components: {
			NavBar,
			BiaofunDatetimePicker
		},
		data() {
			return {
				db: uniCloud.database(),
				amount: '',
				remark: '',
				tabIndex: 2,
				tabList: [
					{ id: 1, name: '收入' },
					{ id: 2, name: '支出' },
				],
				curMonth: dayjs(new Date()).format('YYYY-MM-DD HH:mm'),
				currentAmountType: { icon: 'icon-biaoqian_canyin', name: '餐饮', color: '' },
				currentAmountList: [],
			}
		},
		computed: {
			id () {
				return this.$store.getters.idLive
			},
			theme () {
				return this.$store.getters.themeLive
			},
			primaryTheme () {
				return this.$store.getters.primaryColorLive
			},
		},
		created () {
			this.currentAmountList = this.$store.state.outputTypeList
		},
		methods: {
			formatDate (value, format) {
				if (typeof value == 'string') {
					value = value.replace('年','-').replace('月','-').replace('日','-').replace('时',':').replace('分','')
				}
				const res = dayjs(value).format(format)
				return res
			},
			changeDatetimePicker (date) {
				this.curMonth = `${date.YYYY}-${date.MM}-${date.DD} ${date.hh}:${date.mm}`
			},
			changeTab (item) {
				this.tabIndex = item.id
				this.currentAmountList = this.tabIndex === 1 ? this.$store.state.incomeTypeList : this.$store.state.outputTypeList
				this.currentAmountType = this.currentAmountList[0]
			},
			changeBillType (item) {
				this.currentAmountType = item
			},
			mustNumber () {
				this.amount = this.amount.toString().replace(/[^0-9.]+/g, '')
				// this.$forceUpdate()
			},
			addBill () {
				if (!this.amount) {
					uni.showToast({
						icon: 'error',
						title: '金额不能为空'
					})
					return
				}
				const params = {
					time: new Date(this.curMonth).getTime(),
					type: this.tabIndex, // 1收入 2支出
					userId: this.id,
					amount: Number(this.tabIndex == 2 ? -this.amount : this.amount),
					remark: this.remark,
					amountType: this.currentAmountType,
					// createdTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
				}
				uni.showLoading({ title: '保存中' })
				this.db.collection('bill').add(params).then(res => {
					uni.hideLoading()
					uni.showToast({title:'保存成功'})
					uni.navigateBack()
				}).catch(() => {
					uni.hideLoading()
					uni.showToast({icon:'error',title:'保存失败'})
				})
				// const curDate = dayjs(this.curMonth).format('YYYY-MM')
				// uni.getStorage({
				// 	key: 'bill:' + curDate,
				// 	success(res) {
				// 		const data = JSON.parse(res.data)
				// 		data.list.push(params)
				// 		uni.setStorage({
				// 			key: 'bill:' + curDate,
				// 			data: JSON.stringify(data),
				// 			success() {
				// 				uni.showToast({title:'添加成功'})
				// 				uni.navigateBack({delta: 1})
				// 			}
				// 		})
				// 	},
				// 	fail() {
				// 		const info = {
				// 			buget: 0,
				// 			list: [params]
				// 		}
				// 		uni.setStorage({
				// 			key: 'bill:' + curDate,
				// 			data: JSON.stringify(info),
				// 			success() {
				// 				uni.showToast({title:'添加成功'})
				// 				uni.navigateBack({delta: 1})
				// 			}
				// 		})
				// 	}
				// })
			}
		}
	}
</script>

<style lang="scss" scoped>
.add-bill {
	min-height: 100vh;
	padding: 30rpx;
	.tab {
		@include flex();
		height: 100%;
		
		.tab-item {
			@include flex();
			min-width: 80rpx;
			height: 100%;
			padding: 0 20rpx;
			
			&.tab-active {
				position: relative;
				
				.tab-active-border {
					position: absolute;
					bottom: 0;
					left: 0;
					width: 100%;
					height: 5rpx;
				}
			}
		}
	}
	
	.amount-box {
		@include flex(space-between);
		width: 100%;
		height: 90rpx;
		padding: 0 20rpx;
		border: 1px solid #ddd;
		border-radius: 6rpx;
		
		&.margin-top {
			margin-top: 20rpx;
		}
		
		.amount-type {
			@include flex();
			.iconfont {
				margin-right: 10rpx;
				font-size: 38rpx;
			}
			
			.amount-text {
				font-size: 24rpx;
			}
		}
		
		.amount-input {
			text-align: right;
		}
	}
	
	.bill-type {
		@include flex(flex-start);
		padding: 20rpx 0;
		
		.bill-type-item {
			@include flex(center, center, column);
			width: 110rpx;
			height: 130rpx;
			margin: 0 5rpx 5rpx 0;
			border-radius: 10rpx;
			
			&.bill-type-item-acitve {
				background: #ddd;
			}
			
			.iconfont {
				margin-bottom: 10rpx;
				font-size: 50rpx;
			}
			
			.bill-type-name {
				font-size: 26rpx;
			}
		}
	}
	
	.add-bill-btn {
		border: 1rpx solid transparent;
		color: #fff;
	}
}

.dark {
	.bill-type {
		.bill-type-item {
			&.bill-type-item-acitve {
				color: #333;
			}
		}
	}
}
</style>
