<template>
  <div class="mainbody">
    <div class="blocklist-wrapper">
      <BlockList />
    </div>
  </div>
</template>

<script>
import BlockList from "./BlockList.vue";
export default {
  components: {
    BlockList,
  },
};
</script>

<style scoped>
.mainbody {
  margin: 0;
  width: 100%;
  height: 900px;
  border: 1px solid #000000;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #a0cfff;
  min-height: 90vh;
}
.blocklist-wrapper {
  flex-grow: 1;
}
</style>
