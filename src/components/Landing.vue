<template>
    <div class="p-2 mb-2 bg-light rounded-3">
        <div class="container-fluid py-3">
            <p class="h1 text-start">{{ledger}}</p>
            <div class="col-md-8 fs-4 mb-3">
                <span :class="signerListClass"><i class="bi bi-list-check"></i></span>
                <span :class="regularKeyClass"><i class="bi bi-key-fill"></i></span>
            </div>
            <p class="p-2 mb-2 bg-warning">
                <small class="text-wrap">{{account}}</small>
                <sup>
                    <i v-if="masterKey && !hasSignerList" class="master-key position-absolute top-0 start-0 h1 bi bi-patch-check-fill text-dark"></i>
                    <i v-else class="master-key position-absolute top-0 start-0 h1 bi bi-patch-minus-fill text-dark"></i>
                </sup>
            </p>
            <p v-if="regularKey" class="p-2 mb-2 bg-dark text-white">
                <small class="text-wrap">{{regularKeyAddress}}</small>
            </p>
            <div class="col-md-8 fs-4 mb-5">  
                <p class="text-muted text-end fs-6"><span class="fancy-font">siglists</span>  by three</p>
            </div>
            <p> 
                <button v-if="canRemoveMaster()" type="button" class="btn btn-secondary mb-2" @click="removeMasterKey">Remove Master Key</button>
                <button v-else-if="canRestorMaster()" type="button" class="btn btn-secondary mb-2" @click="restoreMasterKey">Restore Master Key</button>
                <button v-if="!hasSignerList" type="button" class="btn btn-green mb-2 me-2" data-bs-toggle="modal" data-bs-target="#createSignerList">Create Signer List</button>
                <button v-else-if="hasSignerList" type="button" class="btn btn-green mb-2 me-2" data-bs-toggle="modal" data-bs-target="#createSignerList">Edit Signer List</button>
                <button type="button" class="btn btn-purple mb-2 me-2" data-bs-toggle="modal" data-bs-target="#assignRegularKey">Assign Regular Key</button>
            </p>
        </div>
    </div>
    <div class="col-md-12">
        <div v-for="signer_list in signer_lists">
            <p><span class="badge rounded-pill bg-light text-dark">SignerList: <small>{{signer_list.SignerListID}}</small></span></p>
            <div v-for="signer_entry in signer_list.SignerEntries">
                <sup><small class="badge rounded-pill bg-danger me-1 position-absolute top-1 start-0">{{signer_entry.SignerEntry.SignerWeight}}</small></sup>
                <div class="p-3 mb-2 text-white bg-dark">
                    <small class="text-wrap">{{signer_entry.SignerEntry.Account}}</small>
                </div>
            </div>
            
            <h4 class="text-end"><span class="badge rounded-pill bg-light text-dark">Quorum: <small>{{signer_list.SignerQuorum}}</small></span></h4>
            <button v-if="signer_lists.length > 0" type="button" class="btn btn-green mb-2 me-2" data-bs-toggle="modal" data-bs-target="#createSignerList">Edit Signer List</button>
            <hr />
        </div>
    </div>

    <ModalSignerList :client="client" :Sdk="Sdk" :nodetype="nodetype" identity="createSignerList" :hasSignerList="hasSignerList" @reloadData="reloadData"/>
    <ModalAssignRegularKey :client="client" :Sdk="Sdk" :nodetype="nodetype" identity="assignRegularKey" @reloadData="reloadData"/>
</template>

<script>

    import { flagNames } from 'flagnames'
    import ModalSignerList from './ModalSignerList.vue'
    import ModalAssignRegularKey from './ModalAssignRegularKey.vue'
    const xapp = window.xAppSdk

    export default {
        name: 'Landing',
        props: ['client', 'Sdk', 'nodetype'],
        components: {
            ModalSignerList,
            ModalAssignRegularKey
        },
        data() {
            return {
                masterKey: true, 
                regularKey: false, 
                hasSignerList: false,
                isLoading: true,
                signerLists: [],
                selectedRows: [],
                ascending: false,
                regularKeyAddress: null,
                accountAccess: 'FULL'
            }
        },
        async mounted() {
            console.log('landing mounted...')
            this.hasSignerList = await this.signerList()
            console.log('hasSignerList', this.hasSignerList)

            await this.accountInfo()
            
            this.isLoading = false
        },
        computed: {
            regularKeyClass() {
                if (this.regularKey) {
                    return 'bg-dark text-white rounded-3 p-1 mb-1 me-2'
                }
                return 'bg-white rounded-3 p-1 mb-1 me-2'
            },
            signerListClass() {
                if (this.hasSignerList) {
                    return 'bg-dark text-white rounded-3 p-1 mb-1 me-2'
                }
                return 'bg-white rounded-3 p-1 mb-1 me-2'
            },
            ledger() {
                return this.$store.getters.getLedger
            },
            account() {
                return this.$store.getters.getAccount
            },
            signer_lists() {
                return this.$store.getters.getSignerLists
            }
        },
        watch: {
            account() {
                if (this.$store.getters.getAccount != '') {
                    console.log('account changed', this.account)
                }
            }
        },
        methods: {
            canRemoveMaster() {
                if (this.accountAccess !== 'FULL') { 
                    console.log('exit 1')
                    return false } 
                if (!this.masterKey) { 
                    console.log('exit 2')
                    return false }
                if (!this.hasSignerList && this.regularKey) { 
                    console.log('exit 3')
                    return false }

                // all conditions met
                return true
            },
            canRestorMaster() {
                if (this.accountAccess === 'FULL') { return false } 
                if (this.masterKey) { return false } 

                // all conditions met
                return true
            },
            async reloadData() {
                console.log('reloading... DATA')
                this.hasSignerList = await this.signerList()
                await this.accountInfo()
            },
            async accountInfo() {
                const payload = {
                    'id': 1,
                    'command': 'account_info',
                    'account': this.$store.getters.getAccount,
                    'ledger_index': 'validated'
                }
                let res = await this.client.send(payload)
                console.log('accountInfo', res)
                this.$store.dispatch('setAccountData', res.account_data)

                const account_data = this.$store.getters.getAccountData
                console.log('getAccountData', account_data)
                const flags = flagNames(account_data.LedgerEntryType, account_data.Flags)
                console.log('flags', flags)

                // check if master key enabled.
                if (flags.includes('lsfDisableMaster')) {
                    this.masterKey = false
                    console.log('masterkey dissabled')
                }
                // regular key set
                if (flags.includes('lsfPasswordSpent')) {
                    this.regularKey = true
                }

                if ('RegularKey' in account_data) {
                    this.regularKeyAddress = account_data.RegularKey
                }

                const tokenData = this.$store.getters.getXummTokenData
                this.accountAccess = tokenData.accountaccess
                console.log('this.accountAccess', this.accountAccess)
            },
            async editSignerList(SignerListID) {
                console.log('TODO -> editSignerList', SignerListID)
            },
            async removeMasterKey() {
                console.log('removeMasterKey')
                const server_info = await this.client.send({'id': 1, 'command': 'server_info'})
                const base_fee = server_info.info.validated_ledger.base_fee_xrp * 1_000_000
                const account_data = this.$store.getters.getAccountData

                const asfDisableMaster = 4
                const payload = {
                    TransactionType: 'AccountSet',
                    Account: this.$store.getters.getAccount,
                    Fee: String(base_fee),
                    Sequence: account_data.Sequence,
                    SetFlag: asfDisableMaster
                }

                console.log('payload', payload)
                const request  = { txjson: payload }
                console.log('request', request)

                const self = this
                const subscription = await this.Sdk.payload.createAndSubscribe(request, async event => {
                    console.log('New payload event:', event.data)

                    if (event.data.signed === true) {
                        console.log('Woohoo! The sign request was signed :)')
                        self.reloadData()
                        return event.data
                    }

                    if (event.data.signed === false) {
                        console.log('The sign request was rejected :(')
                        return false
                    }
                })
                console.log('setSignerList', subscription)

                xapp.openSignRequest({ uuid: subscription.created.uuid })
                    .then(d => {
                        // d (returned value) can be Error or return data:
                        console.log('openSignRequest response:', d instanceof Error ? d.message : d)
                    })
                    .catch(e => console.log('Error:', e.message))
            },
            async restoreMasterKey() {
                console.log('restoreMasterKey')
                const server_info = await this.client.send({'id': 1, 'command': 'server_info'})
                const base_fee = server_info.info.validated_ledger.base_fee_xrp * 1_000_000
                const account_data = this.$store.getters.getAccountData

                const asfDisableMaster = 4
                const payload = {
                    TransactionType: 'AccountSet',
                    Account: this.$store.getters.getAccount,
                    Fee: String(base_fee),
                    Sequence: account_data.Sequence,
                    ClearFlag: asfDisableMaster
                }

                console.log('payload', payload)
                const request  = { txjson: payload }
                console.log('request', request)

                const self = this
                const subscription = await this.Sdk.payload.createAndSubscribe(request, async event => {
                    console.log('New payload event:', event.data)

                    if (event.data.signed === true) {
                        console.log('Woohoo! The sign request was signed :)')
                        self.reloadData()
                        return event.data
                    }

                    if (event.data.signed === false) {
                        console.log('The sign request was rejected :(')
                        return false
                    }
                })
                console.log('setSignerList', subscription)

                xapp.openSignRequest({ uuid: subscription.created.uuid })
                    .then(d => {
                        // d (returned value) can be Error or return data:
                        console.log('openSignRequest response:', d instanceof Error ? d.message : d)
                    })
                    .catch(e => console.log('Error:', e.message))
            },
            async signerList(marker = undefined) {
                this.$store.dispatch('clearSignerList')

                let found = false
                const payload = {
                    'id': 2,
                    'command': 'account_objects',
                    'account': this.$store.getters.getAccount,
                    'ledger_index': 'validated',
                    'limit': 400
                }
                if (marker != undefined) {
                    payload.marker = marker
                }
                let res = await this.client.send(payload)
                // console.log('signerList', res)
                for (let index = 0; index < res.account_objects.length; index++) {
                    const element = res.account_objects[index]
                    if (element.LedgerEntryType === 'SignerList') {
                        console.log('setSignerList element', element)
                        this.$store.dispatch('setSignerList', element)
                        found = true
                    }
                }
                if (res['marker'] !== undefined) {
                    return await this.checkSignerList(res['marker'])
                }

                if (found) {
                    // console.log('signerLists', this.$store.getters.getSignerLists)
                    const signer_lists = this.$store.getters.getSignerLists
                    for (let index = 0; index < signer_lists.length; index++) {
                        const element = signer_lists[index]
                        console.log('signer_list', element)    
                        console.log('flags', flagNames(element.LedgerEntryType, element.Flags))
                    }
                }

                return found
            },
            currencyHexToUTF8(code) {
				if (code.length === 3)
					return code

				let decoded = new TextDecoder()
					.decode(this.hexToBytes(code))
				let padNull = decoded.length

				while (decoded.charAt(padNull - 1) === '\0')
					padNull--

				return decoded.slice(0, padNull)
			},
            hexToBytes(hex) {
				let bytes = new Uint8Array(hex.length / 2)

				for (let i = 0; i !== bytes.length; i++) {
					bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
				}

				return bytes
			}
        },
    }
</script>

<style scoped>
    .master-key {
        margin-top: -20px;
    }
    .fancy-font {
        font-family: 'Permanent Marker', serif;
    }
    .bog-roll {
        width: 100%;
    }
    .main-text {
        color: #753ee2;
        -webkit-text-stroke-width: 1px;
        -webkit-text-stroke-color: black;
    }
    .btn-purple {
        background-color: #753ee2;
        color: #ffffff;
    }

    .btn-orange {
        background-color: #ff8f07;
        color: #ffffff;
    }

    .text-orange {
        color: #ff8f07;
    }

    .text-green {
        color: #00e56a;
    }

    .text-pink {
        color: #ff1a8b;
    }

    .btn-yellow {
        background-color: #ffc107;
        color: #ffffff;
    }
    .btn-pink {
        background-color: #ff1a8b;
        color: #ffffff;
    }

    .btn-green {
        background-color: #00e56a;
        color: #ffffff;
    }
    .bg-purple {
        background-color: #753ee2;
    }
    .bg-green {
        background-color: #00e56a;
    }
    .open-sign {
        background: url('/public/apple-touch-icon.png');
        background-repeat: no-repeat;
    }
</style>
