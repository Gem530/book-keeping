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
				keyList: [],
				allBill: [],
				uplaodBtn: false,
				currentSize: '0kb',
				nightShow: false,
				startTime: undefined,
				endTime: undefined,
				list: [
					{ icon: 'circle', name: '夜间', id: 1 },
					{ icon: 'color', name: '主题色', id: 2, fun: () => {
							this.toPrimary()
						},
					},
					{ icon: 'color', name: '上传本地数据', id: 5, fun: () => {
							this.uploadStorage()
						},
					},
					{ icon: 'wallet', name: () => {
						return dayjs(this.curMonth).format('YYYY-MM') + '预算:￥' + this.buget
						}, id: 3, fun: () => {
							this.openWallet()
						},
					},
					{ icon: 'trash', name: () => {
						return '退出并清空数据:' + this.currentSize
					}, id: 4, fun: () => {
							this.logOut()
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
					
					that.db.collection('buget').where({
						userId: that.id,
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
					const keys = res.keys.filter(v => v.includes('bill:'))
					if (keys.length) {
						that.keyList = keys
						that.uplaodBtn = true
						let list = []
						for (let i = 0; i < keys.length; i++) {
							const data = JSON.parse(uni.getStorageSync(keys[i]))
							list = list.concat(data.list)
						}
						list.sort((a,b)=> { return (that.getTimeStr(b.time) - that.getTimeStr(a.time)) })
						that.allBill = list
						that.allBill.map(v => {
							v.userId = that.id
							v.time = new Date(v.time + ':00').getTime()
							v.createdTime = undefined
						})
						// console.log(that.allBill)
					} else {
						this.uplaodBtn = false
					}
					that.currentSize = res.currentSize < 1024 ? (res.currentSize + 'KB') : ((res.currentSize / 1024) + 'MB')
				},
			})
		},
		methods: {
			toPrimary () {
				uni.navigateTo({ url: '/pages/primary/primary' })
			},
			uploadStorage () {
				const that = this
				if (that.uplaodBtn) {
					uni.showLoading({ title: '上传中' })
					that.db.collection('bill').add(that.allBill).then(() => {
						uni.hideLoading()
						uni.showToast({title: '上传成功'})
						that.$emit('initBill')
						// that.keyList.forEach(v => {
						// 	uni.removeStorage(v)
						// })
						// that.uplaodBtn = false
					}).catch(() => {
						uni.hideLoading()
						uni.showToast({icon:'error',title: '上传失败'})
					})
				} else {
					uni.showToast({title: '无本地账单'})
				}
			},
			openWallet () {
				this.$refs.inputDialog.open('center')
			},
			logOut () {
				const that = this
				uni.showModal({
					title: '提示',
					content: '清空数据后，数据无法找回，确认清空吗？',
					success(res) {
						if (res?.confirm) {
							uni.clearStorage()
							uni.showToast({title: '清空数据成功'})
							// that.$emit('initBill')
							uni.navigateTo({ url: '/pages/login/index' })
						}
					}
				})
			},
			// 返回时间戳
			getTimeStr(v) {
				return new Date(v).getTime()
			},
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
					this.toPrimary()
				}
				if (item.id == 3) {
					this.openWallet()
				}
				if (item.id == 4) {
					this.logOut()
				}
				if (item.id == 5) {
					this.uploadStorage()
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
					
				that.db.collection('buget').where({
					userId: that.id,
					time: that.db.command.gte(that.startTime)
						.and(that.db.command.lte(that.endTime))
				}).get().then(res => {
					// console.log(res)
					// that.buget = res.result.data.length ? res.result.data[0].buget : 0
					if (res.result.data.length) {
						// 修改预算
						that.db.collection('buget').where({
							userId: that.id,
							time: that.db.command.gte(that.startTime)
								.and(that.db.command.lte(that.endTime))
						}).update({
							userId: that.id,
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
						that.db.collection('buget').add({
							userId: that.id,
							time: that.startTime,
							buget: that.buget
						}).then(res => {
							uni.showToast({title: '添加预算成功'})
							that.$emit('initBuget')
						}).catch(() => {
							uni.showToast({title: '添加预算失败'})
						})
					}
				})
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
