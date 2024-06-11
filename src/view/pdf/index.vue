<script setup lang="ts">

</script>

<template>
<div class="pdf-container">
  <div class="pdf"></div>
</div>
</template>

<style scoped lang="scss">
.pdf-container {
  width: 1920px;
  display: flex;
  justify-content: center;
  .pdf {
    width: 636px;
    height: 905px;
    background-size: 100% 100%;
    background-image: url("img/layout/pdf.png");
  }
}
</style>