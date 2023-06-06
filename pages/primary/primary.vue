<template>
	<view :class="['primary', theme]">
		<NavBar>
			<template #center>主题色</template>
		</NavBar>
		
		<view class="primary-list">
			<view
				:key="item"
				v-for="item in colors"
				:class="{'primary-item': true, 'primary-item-active': item == primaryTheme}"
				:style="{background: item, borderColor: item == primaryTheme ? colorTheme : ''}"
				@click="changePrimary(item)"
			></view>
		</view>
	</view>
</template>

<script>
	import NavBar from '@/component/nav-bar/nav-bar.vue'
	export default {
		name: 'primary',
		components: {
			NavBar
		},
		computed: {
			theme () {
				return this.$store.getters.themeLive
			},
			colorTheme () {
				return this.$store.getters.textColorLive
			},
			primaryTheme () {
				return this.$store.getters.primaryColorLive
			},
		},
		data() {
			return {
				colors: [
					'#358eef',
					'#4cd964',
					'#f0ad4e',
					'#dd524d',
				]
			}
		},
		methods: {
			changePrimary (v) {
				this.$store.commit('changePrimaryColor', v)
				uni.setStorage({
					key: 'primaryColor',
					data: v
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.primary {
	min-height: 100vh;
	padding: 20rpx 30rpx;
	
	.primary-list {
		@include flex(space-between, flex-start);
		
		.primary-item {
			width: 49%;
			height: 100rpx;
			margin: 0 0 10rpx 0;
			border: 5rpx solid transparent;
			border-radius: 20rpx;
			
			&.primary-item-active {
				border: 5rpx solid red;
			}
		}
	}
}
</style>
