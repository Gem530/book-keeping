<template>
	<view>
		<!-- h5可以封装，app不行 ，不能使用动态id -->
		<!-- #ifdef APP-PLUS || H5 -->
		<view
			id="lineChart"
			:prop="option"
			:change:prop="echarts.updateEcharts"
			:style="{width:width,height:height}"
			@click="echarts.onClick"
		></view>
		<!-- #endif -->
	</view>
</template>

<script>
	export default {
		props: {
			id: {
				type: String,
				default: 'chart'
			},
			width: {
				type: String,
				default: '690rpx'
			},
			height: {
				type: String,
				default: '600rpx'
			},
			options: Object
		},
		watch: {
			options: {
				handler(val) {
					if (!val) return
					this.option = this.options
				},
				immediate: true,
				deep: true
			},
		},
		data() {
			return {
				ids: this.id,
				option: this.options
			}
		},
		created() {
			// // 设置随机数id h5可以，app端不行
			// let t = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
			// let len = t.length
			// let id = ''
			// for (let i = 0; i < 32; i++) {
			// 	id += t.charAt(Math.floor(Math.random() * len))
			// }
			// this.id = id
		},
		methods: {
		}
	}
</script>

<script module="echarts" lang="renderjs">
	let myChart
	export default {
		async mounted() {
			// #ifdef APP-PLUS || H5
			await this.addEcharts()
			// #endif
		},
		methods: {
			initEcharts() {
				myChart = echarts.init(document.getElementById('lineChart'))
				// 观测更新的数据在 view 层可以直接访问到
				myChart.setOption(this.option)
			},
			async updateEcharts(newValue, oldValue, ownerInstance, instance) {
				if (window.echarts) {
					// 监听 service 层数据变更
					myChart.setOption(newValue)
				} else {
					await this.addEcharts()
				}
			},
			onClick(event, ownerInstance) {
				// 调用 service 层的方法
				ownerInstance.callMethod('onViewClick', {
					test: 'test'
				})
			},
			addEcharts () {
				const that = this
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						try {
							if (typeof window.echarts === 'function') {
								that.initEcharts()
							} else {
								// 动态引入较大类库避免影响页面展示
								const script = document.createElement('script')
								// view 层的页面运行在 www 根目录，其相对路径相对于 www 计算
								script.src = 'static/echarts.js'
								script.onload = that.initEcharts.bind(that)
								document.head.appendChild(script)
							}
							resolve(true)
						} catch(e){
							//TODO handle the exception
							reject(false)
						}
					}, 10)
				})
			}
		}
	}
</script>

<style>
</style>
