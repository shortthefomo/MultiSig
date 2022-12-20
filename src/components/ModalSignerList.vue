<template>
    <!-- Modal -->
    <div class="modal fade" :id="identity" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" :aria-labelledby="identity +'Label'" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" :id="identity +'Label'">Create Signer List</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Applying a signer list <em>grants access to the signatories</em> to sign any transaction on behalf of your account.</p>
                <p>The composibility of signers is extensive, <strong>use this with extreme caution!</strong></p>
                <p>Visit xrpl.org and read the documentation on multisign, to learn more.</p>
                <br/>
                <p v-if="errors.length" class="text-danger">
                    <b>Please correct the following error(s):</b>
                    <ul>
                        <li v-for="error in errors">{{ error }}</li>
                    </ul>
                </p>

                <div class="add-signer-list">
                    <div class="w-full mt-4 p-10">
                        <button v-if="signerList.length < 32" type="button" class="flex justify-start ms-2 rounded-md border px-3 py-2 bg-purple text-white"
                            @click="addMore()">
                            Add More
                        </button>
                        <div v-for="(signers, index) in signerList" :key="index">
                            <div class="flex justify-start ms-2 mt-4">
                                <input :id="index + 'rAddress'" v-model="signers.address" placeholder="r address" class="w-full py-2 border border-indigo-500 rounded" />
                                <!-- <label class="form-check-label" :for="index + 'weight'"> rAddress</label> -->
                                <input :id="index + 'weight'" v-model="signers.weight" placeholder="weight" class="w-full py-2 border border-indigo-500 rounded" />
                                <!-- <label class="form-check-label" :for="index + 'weight'"> Weight</label> -->
                                <button type="button" class="ms-2 rounded-md border px-3 py-2 bg-warning text-white" @click="remove(index)" v-show="index != 0">
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-start ms-2 mt-4">
                        <input id="quorum" v-model="quorum" placeholder="quorum" class="w-full py-2 border border-indigo-500 rounded" />
                        <!-- <label class="form-check-label" for="quorum"> Quorum</label> -->
                    </div>
                    
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-green" @click="createSignerList">Apply</button>
            </div>
            </div>
        </div>
    </div>
    
</template>
  
<script>
export default {
    name: "Create Signer List",
    props: ['client', 'Sdk', 'nodetype', 'identity', 'hasSignerList'],
    emits: ['updateNewSignerList'],
    data() {
        return {
            errors: [],
            quorum: '',
            signerList: [
                {
                    address: '',
                    weight: ''
                },
            ],
        }
    },
    methods: {
        addMore() {
            this.signerList.push({
                address: '',
                weight: ''
            })
        },
        remove(index) {
            this.signerList.splice(index, 1)
        },
        async createSignerList() {
            console.log('data', this.signerList)
            if(!this.checkForm()) { return }

            console.log('TODO -> createSignerList')
            await this.pushSignerList()
        },
        async pushSignerList() {
            const server_info = await this.client.send({"id": 1, "command": "server_info"})
            console.log('base fee', server_info.info.validated_ledger.base_fee_xrp)

            const base_fee = server_info.info.validated_ledger.base_fee_xrp * 1_000_000
            let fee = String(base_fee)
            if (this.hasSignerList) {
                fee = String((3 + 1) * base_fee)  // (n +1) * fee
            }
            
            const account_data = this.$store.getters.getAccountData
            
            const SignerEntries = []
            for (let index = 0; index < this.signerList.length; index++) {
                const element = this.signerList[index]
                SignerEntries.push({
                    SignerEntry: {
                        Account: element.address,
                        SignerWeight: element.weight
                    }
                })
            }
            const payload = {
                TransactionType: 'SignerListSet',
                Account: this.$store.getters.getAccount,
                Fee: String(fee),
                Sequence: account_data.Sequence,
                SignerQuorum: this.quorum,
                SignerEntries
            }

            console.log('payload', payload)
            const request  = { txjson: payload }
            console.log('request', request)
            const subscription = await this.Sdk.payload.createAndSubscribe(request, async event => {
            console.log('New payload event:', event.data)

            if (event.data.signed === true) {
                console.log('Woohoo! The sign request was signed :)')
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
                //log('openSignRequest response:', d instanceof Error ? d.message : d)
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
            let sum = 0
            for (let index = 0; index < this.signerList.length; index++) {
                this.signerList[index].weight = (this.signerList[index].weight * 1)
                const element = this.signerList[index]
                if(!this.validateAddress(element.address)) {
                    this.errors.push('invalid rAddress')
                }
                
                const weight = (element.weight * 1)
                console.log('weight', weight)
                if (isNaN(weight) || weight < 1) {
                    this.errors.push('invalid weight')
                    console.log('1', isNaN(weight))
                    console.log('2', weight < 1)
                }
                else {
                    sum += weight
                }
            }

            this.quorum = this.quorum * 1
            const quorum = this.quorum
            if (isNaN(quorum) || quorum < 1) {
                this.errors.push('invalid quorum')
                console.log('1', isNaN(quorum))
                console.log('2', quorum < 1)
            }
            else {
                if (quorum < sum) {
                    this.errors.push('quorum must be greater than or equal to all weights summed')
                }
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
    .bg-green {
        background-color: #00e56a;
    }

    .bg-purple {
        background-color: #753ee2;
    }
</style>