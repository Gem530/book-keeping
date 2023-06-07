<template>
	<view>
		<!-- #ifdef APP-PLUS || H5 -->
		<view
			id="pieChart"
			:prop="option"
			:change:prop="echarts.updateEcharts"
			:style="{width:width,height:height}"
			@click="echarts.onClick"
		></view>
		<!-- #endif -->
		<!-- #ifdef MP-WEIXIN -->
			<uni-ec-canvas 
				v-if="ec.option"
				class="uni-ec2-canvas"
				:style="{width:width,height:height,display:'block'}"
				id="uni-ec2-canvas"
				ref="uni-ec2-canvas"
				canvas-id="uni-ec2-canvas"
				:ec="ec"
		   ></uni-ec-canvas>
		<!-- #endif -->
	</view>
</template>

<script>
	// #ifdef MP-WEIXIN
	import uniEcCanvas from '../uni-ec-canvas/uni-ec-canvas.vue'
	// #endif
	export default {
		components: {
			// #ifdef MP-WEIXIN
			uniEcCanvas
			// #endif
		},
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
					// #ifdef MP-WEIXIN
					this.ec.option = this.option
					// #endif
				},
				immediate: true,
				deep: true
			},
		},
		data() {
			return {
				ids: this.id,
				option: this.options,
				// #ifdef MP-WEIXIN
				ec: {
					option: undefined
					
				}
				// #endif
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
	// 引入cdn的echarts包
	let myChart
	export default {
		async mounted() {
			// #ifdef APP-PLUS || H5
			await this.addEcharts()
			// #endif
		},
		methods: {
			initEcharts() {
				myChart = echarts.init(document.getElementById('pieChart'))
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
								script.src = 'https://gem530.github.io/static/echarts.js'
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
