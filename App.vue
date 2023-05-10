<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// #ifdef APP-PLUS
			uni.getStorage({
				key: 'token',
				success(res) {
					if (!res.data) {
						// 未登录
						checkIsSupportSoterAuthentication()
					}
				},
				fail() {
					// 未登录
					checkIsSupportSoterAuthentication()
				}
			})
			
			// 检测是否支持指纹
			function checkIsSupportSoterAuthentication () {
				uni.checkIsSupportSoterAuthentication({
					success(res) {
						// console.log('checkIsSupportSoterAuthentication', res)
						if (res.errMsg == 'checkIsSupportSoterAuthentication:ok' && res.supportMode.includes('fingerPrint')) {
							checkIsSoterEnrolledInDevice()
						} else {
							uni.showToast({
								icon:'error',
								title:res.errMsg + '-' + JSON.stringify(res.supportMode)
							})
						}
					},
					fail() {
						uni.showToast({
							icon:'error',
							title:'您的手机不支持指纹!'
						})
					}
				})
			}
			function checkIsSoterEnrolledInDevice () {
				uni.checkIsSoterEnrolledInDevice({
					checkAuthMode: 'fingerPrint',
					success(res) {
						if (res.errMsg == 'checkIsSoterEnrolledInDevice:ok') {
							// console.log('checkIsSoterEnrolledInDevice', res)
							startSoterAuthentication()
						} else {
							uni.showToast({
								icon:'error',
								title:res.errMsg
							})
						}
					},
					fail() {
						uni.showToast({
							icon:'error',
							title:'您未录入指纹!'
						})
					}
				})
			}
			function startSoterAuthentication () {
				uni.startSoterAuthentication({
					requestAuthModes: ['fingerPrint'],
					challenge: 'token',
					authContent: '开始指纹登录',
					success(res) {
						// console.log('开启指纹登录：', res)
						if (res.errCode == 0) {
							uni.showToast({title:'登录成功！'})
							uni.setStorage({
								key:'token',
								data: 'token:指纹登录成功！'
							})
						} else {
							uni.showToast({icon:'error',title:res.errCode + ':' + res.errMsg})
						}
					},
					fail() {
						uni.showToast({icon:'error',title:'指纹错误！'})
					}
				})
			}
			// #endif
		},
		onShow: function() {
			console.log('App Show')
			const that = this
			// 获取背景色缓存
			uni.getStorage({
				key: 'theme',
				success(res) {
					that.$store.commit('changeTheme', res.data)
				},
				fail() {
					that.$store.commit('changeTheme', 'light')
				}
			})
			// 获取主题色缓存
			uni.getStorage({
				key: 'primaryColor',
				success(res) {
					that.$store.commit('changePrimaryColor', res.data)
				},
				fail() {
					that.$store.commit('changePrimaryColor', '#358eef')
				}
			})
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	@import url('./static/base.css');
	@import url('./static/font/iconfont.css');
	/*每个页面公共css */
	* {
		box-sizing: border-box;
	}
	#app{
	    padding-top: env(safe-area-inset-top);
	}
</style>
