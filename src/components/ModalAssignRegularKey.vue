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
                <p>TODO</p>
                <br/>
                <p v-if="errors.length" class="text-danger">
                    <b>Please correct the following error(s):</b>
                    <ul>
                        <li v-for="error in errors">{{ error }}</li>
                    </ul>
                </p>

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
// import { Buffer } from 'buffer'
// import lib from 'xrpl-accountlib'

export default {
    name: "Create Signer List",
    props: ['client', 'Sdk', 'nodetype', 'identity'],
    emits: ['reloadData'],
    data() {
        return {
            modal: null,
            errors: [],
        }
    },
    mounted() {
        this.modal = new Modal(this.$refs[this.identity + 'Modal'])
        // this.accountSetup()
    },
    watch: {
        hasSignerList(value) {
            console.log('>>>>>>> hasSignerList', value)
            if (value) {
                this.signerList = []
                const lists = this.$store.getters.getSignerLists
                console.log('list', lists)
                for (let index = 0; index < lists[0].SignerEntries.length; index++) {
                    const element = lists[0].SignerEntries[index]
                    console.log('element', element)
                    this.signerList.push({
                        address: element.SignerEntry.Account,
                        weight: element.SignerEntry.SignerWeight
                    })
                }
                this.quorum = lists[0].SignerQuorum
            }
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
        accountSetup() {
            const familySeed = lib.generate.familySeed()
            const data = JSON.stringify(familySeed)
            console.log('New key pair generated.')
            console.log('familySeed', familySeed)
        },
        assignRegularKey() {
            // https://xrpl.org/assign-a-regular-key-pair.html
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