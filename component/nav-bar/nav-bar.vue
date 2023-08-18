<template>
	<view>
		<!-- #ifdef MP-WEIXIN -->
		<view class="position-head" :style="{height: statusBarHeight + 'rpx'}"></view>
		<!-- #endif -->
		<view :class="['nav-bar', theme]" :style="{height: statusBarHeight + baseHeight + 'rpx',paddingTop: statusBarHeight + 'rpx'}">
			<view class="nav-left">
				<slot name="left"><uni-icons type="back" size="20" @click="toBack"  :color="colorTheme"></uni-icons></slot>
			</view>
			<view class="nav-center"><slot name="center">{{title}}</slot></view>
			<view class="nav-right"><slot name="right"></slot></view>
		</view>
		<view class="nav-bar-placehander" :style="{height: statusBarHeight + baseHeight + 'rpx'}"></view>
	</view>
</template>

<script>
	export default {
		name: "NavBar",
		props: {
			title: {
				type: String,
				default: ''
			}
		},
		computed: {
			theme () {
				return this.$store.getters.themeLive
			},
			colorTheme () {
				return this.$store.getters.textColorLive
			}
		},
		data() {
			return {
				baseHeight: 92,
				statusBarHeight: 0
			}
		},
		created() {
			const { statusBarHeight } = uni.getSystemInfoSync()
			this.statusBarHeight = document ? statusBarHeight : statusBarHeight + 20
			// #ifdef MP-WEIXIN
			const res = wx.getMenuButtonBoundingClientRect()
			this.statusBarHeight += (res.top + res.height + 30)
			// #endif
		},
		methods: {
			toBack () {
				uni.navigateBack({delta: 1})
			}
		}
	}
</script>

<style lang="scss" scoped>
.position-head {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	background: #000;
	opacity: 0.5;
	z-index: 11;
}
.nav-bar {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	// background: var(--theme-body-bg);
	padding: 0 20rpx;
	z-index: 10;
	
	.nav-left,
	.nav-center,
	.nav-right {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		// color: var(--theme-text-color);
	}
	
	.nav-center {
		flex: 2;
	}
	.nav-left {
		justify-content: flex-start;
	}
	.nav-right {
		justify-content: flex-end;
	}
}
.nav-bar-placehander {
	width: 100%;
}
</style>
