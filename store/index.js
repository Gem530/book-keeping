import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		id: undefined,
		theme: 'light',
		textColor: '#333',
		bodyBg: '#fff',
		primaryColor: '#358eef',
		incomeTypeList: [
			// { icon: 'icon-biaoqian_chuguan', name: '工资', color: 'var(--theme-primary)' },
			{ icon: 'icon-biaoqian_chuguan', name: '工资', color: '' },
			{ icon: 'icon-biaoqian_xuexiao', name: '奖学金', color: '' },
			{ icon: 'icon-biaoqian_rukou', name: '其他收入', color: '' },
		],
		outputTypeList: [
			{ icon: 'icon-biaoqian_canyin', name: '餐饮', color: '' },
			{ icon: 'icon-biaoqian_binguan', name: '住宿', color: '' },
			{ icon: 'icon-biaoqian_keyunchezhan', name: '交通', color: '' },
			{ icon: 'icon-biaoqian_jingqing', name: '水电', color: '' },
			{ icon: 'icon-biaoqian_cangku', name: '学费', color: '' },
			{ icon: 'icon-biaoqian_gonggongyulechangsuo', name: '娱乐', color: '' },
			{ icon: 'icon-biaoqian_shehuijiuzhu', name: '捐赠', color: '' },
			{ icon: 'icon-biaoqian_youeryuan', name: '医疗', color: '' },
			{ icon: 'icon-biaoqian_chukou', name: '其他支出', color: '' },
		]
	},
	getters: {
		idLive (state) {
			return state.id
		},
		themeLive (state) {
			return state.theme
		},
		textColorLive (state) {
			return state.textColor
		},
		bodyBgLive (state) {
			return state.bodyBg
		},
		primaryColorLive (state) {
			return state.primaryColor
		},
	},
	mutations: {
		changeId (state, id) {
			state.id = id
		},
		changeTheme (state, theme) {
			state.theme = theme
			if (state.theme == 'light') {
				state.textColor = '#333'
				state.bodyBg = '#fff'
			} else {
				state.textColor = '#fff'
				state.bodyBg = '#333'
			}
		},
		changePrimaryColor (state, primaryColor) {
			state.primaryColor = primaryColor
		},
	}
})

export default store