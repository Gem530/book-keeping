<template>
	<view>
		<view :class="`nav-bar ${$store.getters.themeLive}`" :style="{height: statusBarHeight + baseHeight + 'rpx',paddingTop: statusBarHeight + 'rpx'}">
			<view class="nav-left">
				<slot name="left"><uni-icons type="back" size="20" @click="toBack"  :color="$store.getters.textColorLive"></uni-icons></slot>
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
		data() {
			return {
				baseHeight: 92,
				statusBarHeight: 0
			}
		},
		created() {
			const { statusBarHeight } = uni.getSystemInfoSync()
			this.statusBarHeight = document ? statusBarHeight : statusBarHeight + 20
		},
		methods: {
			toBack () {
				uni.navigateBack({delta: 1})
			}
		}
	}
</script>

<style lang="scss" scoped>
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
