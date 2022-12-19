<template>
    <div class="p-2 mb-2 bg-light rounded-3">
        <div class="container-fluid py-3">
            <p class="h1 text-start">{{ledger}}</p>
            <p class="p-2 mb-2 bg-warning">
                <small class="text-wrap">{{account}}</small>
                <sup>
                    <i v-if="masterKeyEnabled" class="master-key position-absolute top-0 start-0 h1 bi bi-patch-check-fill text-primary"></i>
                    <i v-else class="master-key position-absolute top-0 start-0 h1 bi bi-patch-minus-fill text-warning"></i>
                </sup>
            </p>
            
            <div class="col-md-8 fs-4">                
                <p class="text-muted text-end fs-6"><span class="fancy-font">multisig</span>  by three</p>
            </div>  
        </div>
    </div>
    <div class="col-md-12">
        <div v-for="signer_list in signer_lists">
            <p>SignerList: <small>{{signer_list.SignerListID}}</small></p>
            <div v-for="signer_entry in signer_list.SignerEntries">
                <sup><small class="badge rounded-pill bg-danger me-1 position-absolute top-1 start-0">{{signer_entry.SignerEntry.SignerWeight}}</small></sup>
                <div class="p-3 mb-2 text-white bg-dark">
                    <small class="text-wrap">{{signer_entry.SignerEntry.Account}}</small>
                </div>
            </div>
            <h4 class="text-end">Quorum: <small>{{signer_list.SignerQuorum}}</small></h4>
        </div>
    </div>
    <!-- <footer>
        <p class="h1 text-center">{{ledger}}</p>
        <p class="p-3 mb-2 bg-warning text-white">{{account}}</p>
    </footer> -->
</template>

<script>
    import { flagNames } from 'flagnames'
    import { Buffer } from 'buffer'

    const xapp = window.xAppSdk

    export default {
        name: 'Landing',
        props: ['client', 'Sdk', 'nodetype'],
        data() {
            return {
                masterKeyEnabled: true, 
                hasSignerList: false,
                isLoading: true,
                signerLists: [],
                selectedRows: [],
                ascending: false
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
                if ('lsfDisableMaster' in flags) {
                    this.masterKeyEnabled = false
                    console.log('masterkey dissabled')
                }
            },
            async signerList(marker = undefined) {
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
                        this.$store.dispatch('setSignerList', element)
                        found = true
                    }
                }
                if (res['marker'] !== undefined) {
                    return await this.checkSignerList(res['marker'])
                }

                if (found) {
                    console.log('signerLists', this.$store.getters.getSignerLists)
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

    .open-sign {
        background: url('/public/apple-touch-icon.png');
        background-repeat: no-repeat;
    }
</style>
