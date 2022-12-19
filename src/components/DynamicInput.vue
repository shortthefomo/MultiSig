<template>
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
</template>
  
<script>
export default {
    name: "Create Signer List",
    props: ['client', 'Sdk', 'nodetype'],
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
    },
    watch: {
        signerList() {
            this.$emit('updateNewSignerList', this.signerList)
        }
    }
};
</script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .bg-green {
        background-color: #00e56a;
    }

    .bg-purple {
        background-color: #753ee2;
    }
</style>