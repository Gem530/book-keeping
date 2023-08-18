<template>
	<view>
		<uni-popup ref="popup" background-color="#fff" @change="change">
			<view :class="['popup-content', theme]">
				<view class="sider-top"></view>
				<view class="sider-list">
					<view class="sider-item" v-for="item in list" :key="item.id" @click="() => silderClick(item)">
						<uni-icons class="sider-icon" :type="item.icon" size="20" :color="colorTheme"></uni-icons>
						<text class="sider-name">{{isType(item.name) == 'function' ? item.name() : item.name}}</text>
						<zero-switch  v-model="nightShow" v-if="item.id == 1" :size="20" @change="changeBg"></zero-switch>
					</view>
				</view>
			</view>
		</uni-popup>
		
		<uni-popup ref="inputDialog" type="dialog">
			<uni-popup-dialog ref="inputClose"  mode="input" title="填写预算" value=""
				placeholder="请填写预算" @confirm="dialogInputConfirm"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	import dayjs from 'dayjs'
	export default {
		name: 'Sider',
		props: {
			curMonth: String
		},
		data() {
			return {
				db: uniCloud.database(),
				buget: 0,
				currentSize: '0kb',
				nightShow: false,
				startTime: undefined,
				endTime: undefined,
				list: [
					{ icon: 'circle', name: '夜间', id: 1 },
					{ icon: 'color', name: '主题色', id: 2, fun: () => {
							uni.navigateTo({ url: '/pages/primary/primary' })
						},
					},
					{ icon: 'wallet', name: () => {
						return dayjs(this.curMonth).format('YYYY-MM') + '预算:￥' + this.buget
						}, id: 3, fun: () => {
							this.$refs.inputDialog.open('center')
						},
					},
					{ icon: 'trash', name: () => {
						return '退出并清空数据:' + this.currentSize
					}, id: 4, fun: () => {
							const that = this
							uni.showModal({
								title: '提示',
								content: '清空数据后，数据无法找回，确认清空吗？',
								success(res) {
									if (res?.confirm) {
										uni.clearStorage()
										uni.showToast({title: '清空数据成功'})
										that.$emit('initBill')
									}
								}
							})
						},
					},
				]
			}
		},
		watch: {
			curMonth: {
				handler (val) {
					const that = this
					const curDate = dayjs(that.curMonth).format('YYYY-MM')
					// console.log(curDate)
					const yAndM = curDate.toString().split('-')
					let endDate = this.getMonthDay(yAndM[0], yAndM[1])
					endDate = endDate < 10 ? '0' + endDate: endDate
					that.startTime = new Date(curDate+'-01 00:00:00').getTime()
					that.endTime = new Date(curDate+'-'+endDate+' 23:59:59').getTime()
					
					this.db.collection('buget').where({
						userId: this.id,
						time: that.db.command.gte(that.startTime)
							.and(that.db.command.lte(that.endTime))
					}).get().then(res => {
						// console.log(res)
						that.buget = res.result.data.length ? res.result.data[0].buget : 0
					})
				},
				immediate: true,
				deep: true
			}
		},
		computed: {
			id () {
				return this.$store.getters.idLive
			},
			theme () {
				return this.$store.getters.themeLive
			},
			colorTheme () {
				return this.$store.getters.textColorLive
			}
		},
		created() {
			const that = this
			// 判断开关按钮显示
			uni.getStorage({
				key: 'theme',
				success(res) {
					that.nightShow = res.data == 'dark'
				},
				fail() {
					that.nightShow = false
				}
			})
			
			uni.getStorageInfo({
				success(res) {
					// console.log(res)
					that.currentSize = res.currentSize < 1024 ? (res.currentSize + 'KB') : ((res.currentSize / 1024) + 'MB')
				},
			})
		},
		methods: {
			getMonthDay(year, month) {
			  let days = new Date(year, Number(month), 0).getDate()
			  return days
			},
			change (e) {
				this.$emit('change', e)
			},
			isType (val) {
			  let type = Object.prototype.toString.call(val).replace(']', '').split(' ')[1].toLocaleLowerCase()
			  return type
			},
			silderClick (item) {
				// #ifdef APP-PLUS || H5
				item.fun && item.fun()
				// #endif
				// #ifdef MP-WEIXIN
				if (item.id == 2) {
					uni.navigateTo({ url: '/pages/primary/primary' })
				}
				if (item.id == 3) {
					this.$refs.inputDialog.open('center')
				}
				if (item.id == 4) {
					const that = this
					uni.showModal({
						title: '提示',
						content: '清空数据后，数据无法找回，确认清空吗？',
						success(res) {
							if (res?.confirm) {
								uni.clearStorage()
								uni.showToast({title: '清空数据成功'})
								that.$emit('initBill')
							}
						}
					})
				}
				// #endif
			},
			changeBg (value) {
				this.$store.commit('changeTheme', this.$store.getters.themeLive == 'light' ? 'dark' : 'light')
				uni.setStorage({
					key: 'theme',
					data: this.$store.getters.themeLive
				})
			},
			dialogInputConfirm (val) {
				const that = this
				that.buget = val
				that.$refs.inputDialog.close()
				
				// const curDate = dayjs(that.curMonth).format('YYYY-MM')
					
				this.db.collection('buget').where({
					userId: this.id,
					time: that.db.command.gte(that.startTime)
						.and(that.db.command.lte(that.endTime))
				}).get().then(res => {
					// console.log(res)
					// that.buget = res.result.data.length ? res.result.data[0].buget : 0
					if (res.result.data.length) {
						// 修改预算
						this.db.collection('buget').where({
							userId: this.id,
							time: that.db.command.gte(that.startTime)
								.and(that.db.command.lte(that.endTime))
						}).update({
							userId: this.id,
							time: that.startTime,
							buget: that.buget
						}).then(res => {
							uni.showToast({title: '修改预算成功'})
							this.$emit('initBuget')
						}).catch(() => {
							uni.showToast({title: '修改预算失败'})
						})
					} else {
						// 添加预算
						this.db.collection('buget').add({
							userId: this.id,
							time: that.startTime,
							buget: that.buget
						}).then(res => {
							uni.showToast({title: '添加预算成功'})
							this.$emit('initBuget')
						}).catch(() => {
							uni.showToast({title: '添加预算失败'})
						})
					}
				})
				// uni.getStorage({
				// 	key: 'bill:' + curDate,
				// 	success(res) {
				// 		const data = JSON.parse(res.data)
				// 		data.buget = that.buget
				// 		uni.setStorage({
				// 			key: 'bill:' + curDate,
				// 			data: JSON.stringify(data),
				// 			success() {
				// 				uni.showToast({title:'操作成功'})
				// 				that.$emit('initBill')
				// 			}
				// 		})
				// 	},
				// 	fail() {
				// 		const info = {
				// 			buget: that.buget,
				// 			list: []
				// 		}
				// 		uni.setStorage({
				// 			key: 'bill:' + curDate,
				// 			data: JSON.stringify(info),
				// 			success() {
				// 				uni.showToast({title:'操作成功'})
				// 				that.$emit('initBill')
				// 			}
				// 		})
				// 	}
				// })
			}
		}
	}
</script>

<style lang="scss" scoped>
.popup-content {
	width: 500rpx;
	min-height: 100vh;
	// background: var(--theme-body-bg);
	
	.sider-top {
		width: 100%;
		height: 300rpx;
		background: url('https://gem530.github.io/static/sider-bg.jpg') no-repeat;
		background-size: cover;
		border-radius: 0 0 15rpx 15rpx;
		overflow: hidden;
	}
	
	.sider-list {
		.sider-item {
			@include flex(flex-start, center);
			padding: 15rpx 25rpx;
			// color: var(--theme-text-color);
			
			.sider-icon {
				margin-right: 10rpx;
			}
			
			.sider-name {
				flex: 1;
				font-size: 24rpx;
				font-weight: 600;
			}
		}
	}
}
</style>
