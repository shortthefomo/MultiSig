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
                <p>Add accounts to a signer list and assign then weights. Applying the signer list <em>grants access to the signatories</em> to sign any transaction for your account.</p>
                <p>The composibility of signers is extensive, <strong>use this with extreme caution!</strong></p>

                <div class="add-signer-list">
                    <div class="w-full mt-4 p-10">
                        <button v-if="signerList.length < 32" type="button" class="flex justify-start ms-2 rounded-md border px-3 py-2 bg-purple text-white"
                            @click="addMore()">
                            Add More
                        </button>
                        <div v-for="(signers, index) in signerList" :key="index">
                            <div class="flex justify-start ms-2 mt-4">
                                <input v-model="signers.rAddress" placeholder="r address" class="w-full py-2 border border-indigo-500 rounded" />
                                <input v-model="signers.weight" placeholder="weight" class="w-full py-2 border border-indigo-500 rounded" />
                                <button type="button" class="ms-2 rounded-md border px-3 py-2 bg-warning text-white" @click="remove(index)" v-show="index != 0">
                                    Remove
                                </button>
                            </div>
                        </div>
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
    props: ['client', 'Sdk', 'nodetype', 'identity'],
    emits: ['updateNewSignerList'],
    data() {
        return {
            signerList: [
                {
                    rAddress: "",
                    weight: 1
                },
            ],
        }
    },
    methods: {
        addMore() {
            this.signerList.push({
                rAddress: "",
                weight: 0
            })
        },
        remove(index) {
            this.signerList.splice(index, 1)
        },
        async createSignerList() {
            console.log('TODO -> createSignerList')
            console.log('data', this.signerList)
        },
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