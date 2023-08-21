<template>
	<view class="login">
		<NavBar>
			<template #left></template>
			<template #center>登录</template>
			<!-- <template #right><uni-icons type="search" size="20" :color="colorTheme" @click="toPath('/pages/search/search')"></uni-icons></template> -->
		</NavBar>
		<input class="uni-input" type="text" v-model="phone" placeholder="请输入账号">
		<input class="uni-input" type="password" v-model="password" placeholder="请输入密码">
		<button @click="login">登录</button>
		<button @click="register">注册</button>
	</view>
</template>

<script>
	import NavBar from '@/component/nav-bar/nav-bar.vue'
	import {encrypt,decrypt} from '@/component/jsencrypt.js'
	export default {
		components: {
			NavBar
		},
		data() {
			return {
				db: uniCloud.database(),
				id: undefined,
				phone: undefined,
				password: undefined
			}
		},
		onShow() {
		},
		methods: {
			toHome() {
				// 登录注册成功，去首页
				uni.navigateTo({ url: '/pages/index/index' })
				uni.setStorage({
					key:'token',
					data: ''+this.id
				})
			},
			login() {
				if (!this.phone && !this.password) {
					uni.showToast({icon:'error',title:'请输入账号密码'})
					return
				}
				uni.showLoading({
					title: '加载中'
				})
				this.db.collection('user').where({phone: this.phone}).get().then(res => {
					const data= res.result.data
					uni.hideLoading()
					if (data.length) {
						// console.log('登录', this.phone, encrypt(this.password), decrypt(data[0].password))
						if (decrypt(data[0].password) == this.password) {
							uni.showToast({title:'登录成功'})
							this.id = data[0]._id
							this.$store.commit('changeId', this.id)
							this.toHome()
						} else {
							uni.showToast({icon:'error',title:'账号或密码不正确'})
						}
					} else {
						uni.showToast({icon:'error',title:'账号不存在'})
					}
				}).catch((err) => {
					uni.hideLoading()
					uni.showToast({icon:'error',title:err.message})
				})
			},
			register() {
				if (!this.phone && !this.password) {
					uni.showToast({icon:'error',title:'请输入账号和密码！'})
					return
				}
				uni.showLoading({ title: '加载中' })
				this.db.collection('user').where({phone: this.phone}).get().then(res => {
					const data= res.result.data
					uni.hideLoading()
					if (data.length) {
						uni.showToast({icon:'error',title:'账号已存在'})
					} else {
						this.db.collection('user').add({
							name: this.phone,
							phone: this.phone,
							password: encrypt(this.password)
						}).then(() => {
							uni.showToast({title:'注册成功'})
							this.toHome()
						}).catch((err) => {
							uni.showToast({icon:'error',title:err.message})
						})
					}
				}).catch((err) => {
					uni.hideLoading()
					uni.showToast({icon:'error',title:err.message})
				})
			}
		}
	}
</script>

<style>
</style>