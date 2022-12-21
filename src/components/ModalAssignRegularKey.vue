<template>
    <!-- Modal -->
    <div class="modal fade" :ref="identity + 'Modal'" :id="identity" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" :aria-labelledby="identity +'Label'" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" :id="identity +'Label'">Assign Regualr Key</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Create a new full access account in xumm via the +Account button. Record its rAddress and use that here.</p>
                <p>Once this form has been completed and submitted, edit this account and change it to read only.</p>
                <p>Settings->Accounts->(this account)-> choose read only.</p>
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
                <button type="button" class="btn btn-green" @click="assignRegularKey">Rekey</button>
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
    props: ['client', 'Sdk', 'nodetype', 'identity'],
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
        async assignRegularKey() {
            // https://xrpl.org/assign-a-regular-key-pair.html
            if (RegularKey == null) { return }
            if (this.checkForm() == false) { return } 

            const payload = {
                TransactionType: 'SetRegularKey',
                Account: this.$store.getters.getAccount,
                RegularKey: RegularKey,
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

    .bg-purple {
        background-color: #753ee2;
    }
</style>