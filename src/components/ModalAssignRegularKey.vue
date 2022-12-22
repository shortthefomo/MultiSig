<template>
    <!-- Modal -->
    <div class="modal fade" :ref="identity + 'Modal'" :id="identity" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" :aria-labelledby="identity +'Label'" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" :id="identity +'Label'">Assign Regular Key</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>The XRP Ledger allows an account to authorize a secondary key pair, called a <em>regular key pair</em>, to sign future transactions. If the private key of a regular key pair is compromised, you can remove or replace it without changing the rest of your <em>account</em> and re-establishing its relationships to other accounts. You can also rotate a regular key pair proactively.</p>
                <ol>
                    <li>create new account in xumm (full access)</li>
                    <li><strong>after assigning a key</strong> change this account to read only in xumm</li>
                </ol>
                <br/>
                <p v-if="errors.length" class="text-danger">
                    <b>Please correct the following error(s):</b>
                    <ul>
                        <li v-for="error in errors">{{ error }}</li>
                    </ul>
                </p>
                <div class="regular-key-from">
                    <div class="w-full mt-4 p-10">
                        <div class="flex justify-start ms-2 mt-4">
                            <input id="rAddress" v-model="RegularKey" placeholder="r address" class="mb-2 w-full py-2 border border-indigo-500 rounded" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button v-if="hasSignerList || masterKey" type="button" class="btn btn-secondary" @click="assignRegularKey(true)">Remove Key</button>
                <button type="button" class="btn btn-purple" @click="assignRegularKey">Assign Key</button>
            </div>
            </div>
        </div>
    </div>
    
</template>
  
<script>
const xapp = window.xAppSdk
import { Modal } from 'bootstrap'

export default {
    name: "Create Signer List",
    props: ['client', 'Sdk', 'nodetype', 'identity', 'masterKey', 'hasSignerList'],
    emits: ['reloadData'],
    data() {
        return {
            RegularKey: null,
            modal: null,
            errors: [],
        }
    },
    mounted() {
        this.modal = new Modal(this.$refs[this.identity + 'Modal'])
    },
    methods: {
        async assignRegularKey(clearKey = false) {
            // https://xrpl.org/assign-a-regular-key-pair.html
            if (!clearKey && this.RegularKey == null) { return }
            if (!clearKey && this.checkForm() == false) { return } 

            const payload = {
                TransactionType: 'SetRegularKey',
                Account: this.$store.getters.getAccount,
            }
            if (!clearKey) {
                payload[RegularKey] = this.RegularKey
            }
            
            console.log('payload', payload)
            const request  = { txjson: payload }
            console.log('request', request)

            const self = this
            const subscription = await this.Sdk.payload.createAndSubscribe(request, async event => {
                console.log('New payload event:', event.data)

                if (event.data.signed === true) {
                    console.log('Woohoo! The sign request was signed :)')
                    self.$emit('reloadData')
                    self.modal.hide()
                    return event.data
                }

                if (event.data.signed === false) {
                    console.log('The sign request was rejected :(')
                    return false
                }
            })
            console.log('SetRegularKey', subscription)

            xapp.openSignRequest({ uuid: subscription.created.uuid })
                .then(d => {
                    // d (returned value) can be Error or return data:
                    console.log('openSignRequest response:', d instanceof Error ? d.message : d)
                })
                .catch(e => console.log('Error:', e.message))
        },
        validateAddress(address) {
            let ALLOWED_CHARS = 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz'
            let regexp = new RegExp('^r[' + ALLOWED_CHARS + ']{27,35}$')

            if (regexp.test(address)) {
                return true
            }
            return false
        },
        checkForm() {
            this.errors = []
            
            if (!this.validateAddress(this.RegularKey)) {
                this.errors.push('invalid rAddress')
            }

            if (this.errors.length > 0) {
                return false
            }
            return true
        }
    },
};
</script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .btn-green {
        background-color: #00e56a;
        color: #ffffff;
    }
    .btn-yellow {
        background-color: #ffc107;
        color: #ffffff;
    }
    .bg-green {
        background-color: #00e56a;
    }
    .btn-purple {
        background-color: #753ee2;
        color: #ffffff;
    }
    .bg-purple {
        background-color: #753ee2;
    }
</style>