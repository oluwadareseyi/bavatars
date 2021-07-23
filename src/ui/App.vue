<template>
  <main class="c-main"></main>
</template>

<script>
import '../figma/figma-ds/js/selectMenu';
import '../figma/figma-ds/js/iconInput';
import '../figma/figma-ds/js/disclosure';
import axios from 'axios';

import Welcome from './components/Welcome';

export default {
  data() {
    return {
      search: '',
      loading: false,
      baseUrl: 'https://api.bavatars.co/api/bavatars',
      avatars: null,
      gender: [
        { name: 'male', active: false },
        { name: 'female', active: true }
      ],
      nature: [
        { name: 'casual', active: false },
        { name: 'professional', active: false }
      ]
    };
  },

  computed: {
    filteredAvatars() {
      const genderFilter = this.gender.find(gender => gender.active === true);
      const natureFilter = this.nature.find(nature => nature.active === true);

      return this.avatars?.filter(avatar => {
        const gFilter = genderFilter
          ? avatar.gender === genderFilter.name
          : true;

        const nFilter = natureFilter
          ? avatar.nature === natureFilter.name
          : true;

        return gFilter && nFilter;
      });
    }
  },

  components: {
    Welcome
  },

  mounted() {
    // Initialize the figma-ds components
    window.selectMenu.init();
    window.iconInput.init();
    window.disclosure.init();

    // window.onmessage = event => {
    //   const { type, name, data } = event.data.pluginMessage;

    //   //  recieve data
    //   if (type === 'event-name') {
    //     console.log('event called');
    //   }
    // };

    this.fetchAvatars();

    // window.onmessage = event => {
    //   const { type = '', name = '', data = 1 } = event.data.pluginMessage;
    //   //  recieve data
    //   if (type === 'random') {
    //     this.fetchRandomAvatar(data);
    //   } else {
    //     // this.fetchAvatars();
    //   }
    // };
  },
  methods: {
    buttonClick() {
      parent.postMessage(
        {
          pluginMessage: {
            type: 'event-click'
          }
        },
        '*'
      );
    },
    async fetchAvatar(imageUrl) {
      try {
        const res = await fetch(imageUrl);
        const a = await res.arrayBuffer();
        return new Uint8Array(a);
      } catch (error) {
        console.log(error);
      }
    },

    async fetchRandomAvatar(num = 1) {
      try {
        let number = 0;
        const res = await axios.get(
          `${this.baseUrl}?shuffle=true&number=${num}`
        );

        let imageArray = [];

        const dataArray = res.data.data;

        for (const data of dataArray) {
          const res = await this.fetchAvatar(data.url);

          imageArray.push(res);
          number += 1;
          if (number === num) {
            parent.postMessage(
              {
                pluginMessage: {
                  type: 'getimages',
                  data: imageArray
                }
              },
              '*'
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
    },

    async fetchSpecificAvatar(num = 1) {
      try {
        let number = 0;
        const res = await axios.get(
          `${this.baseUrl}?gender=female&shuffle=true&number=1`
        );

        let imageArray = [];

        const dataArray = res.data.data;

        for (const data of dataArray) {
          const res = await this.fetchAvatar(data.url);

          imageArray.push(res);
          number += 1;
          if (number === num) {
            parent.postMessage(
              {
                pluginMessage: {
                  type: 'getimages',
                  data: imageArray
                }
              },
              '*'
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
    },

    async fetchAvatars() {
      this.loading = true;
      try {
        const res = await axios.get(`${this.baseUrl}`);
        this.avatars = res.data.data;
      } catch (error) {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'show-error'
            }
          },
          '*'
        );
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="scss">
@import '../figma/figma-ds/figma-plugin-ds';
</style>
