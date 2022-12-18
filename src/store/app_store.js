'use strict'
 /* eslint-disable */ 
export const AppStore = {
    state: () => ({
        version: '0.0.1',
        xumm: {
            tokenData: null
        },
        account: '',
        user_token: '',
        signer_list: [],

        ledger: 0
    }),
    actions: {
        xummTokenData({commit}, data) {
            commit('TOKEN_DATA', data)
        },
        setUserToken({commit}, user_token) {
            commit('USER_TOKEN', user_token)
        },
        setAccount({commit}, account) {
            commit('ACCOUNT', account)
        },
        setSignerList({commit}, account) {
            commit('SIGNER_LIST', account)
        },
        setLedger({commit}, ledger) {
            commit('LEDGER', ledger)
        }
    },
    mutations: {
        TOKEN_DATA(state, data) {
            state.xumm.tokenData = data
        },
        ACCOUNT(state, account) {
            state.account = account
        },
        SIGNER_LIST(state, signer_list) {
            state.signer_list = signer_list
        },
        USER_TOKEN(state, user_token) {
            state.user_token = user_token
        },
        LEDGER(state, ledger) {
            state.ledger = ledger
        }
    },
    getters: {
        getVersion: state => {
            return state.version
        },
        getXummTokenData: state => {
            return state.xumm.tokenData
        },
        getUserToken: state => {
            return state.user_token
        },
        getAccount: state => {
            return state.account
        },
        getSignerList: state => {
            return state.signer_list
        },
        getLedger: state => {
            return state.ledger
        }
    }
}