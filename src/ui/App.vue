<template>
  <main class="c-main">
    <section class="c-header">
      <div class="c-header__list">
        <div class="c-list__title">Show:</div>
        <button
          @click="resetAll"
          :class="`c-list__item ${!oneActive ? 'active' : ''}`"
        >
          All
        </button>
      </div>

      <div class="c-header__list">
        <div class="c-list__title">By Gender:</div>
        <button
          :class="`c-list__item ${item.active ? 'active' : ''}`"
          v-for="(item, index) in gender"
          :key="index"
          @click="setGender(item.name)"
        >
          {{ item.name }}
        </button>
      </div>

      <div class="c-header__list">
        <div class="c-list__title">By Type:</div>
        <button
          v-for="(item, index) in nature"
          :class="`c-list__item ${item.active ? 'active' : ''}`"
          :key="index"
          @click="setNature(item.name)"
        >
          {{ item.name }}
        </button>
      </div>

      <div class="c-header__list">
        <div class="c-list__title">By Age:</div>
        <select class="c-list__select" v-model="selected">
          <option value="">All ages</option>
          <option>18-25</option>
          <option>26-39</option>
          <option>40+</option>
        </select>
      </div>
    </section>

    <section class="c-body">
      <div class="c-grid" v-if="!loading && filteredAvatars">
        <div
          class="c-box"
          :style="`--delay: 0.${index}s`"
          v-for="(avatar, index) in filteredAvatars"
          :key="index"
        >
          <img
            :src="avatar.url"
            alt="avatar"
            class="cbox__image"
            loading="lazy"
          />
        </div>
      </div>
    </section>

    <footer class="c-footer">
      <logo />
    </footer>
  </main>
</template>

<script>
import '../figma/figma-ds/js/selectMenu';
import '../figma/figma-ds/js/iconInput';
import '../figma/figma-ds/js/disclosure';
import axios from 'axios';

import Welcome from './components/Welcome';
import Close from './components/Close.vue';
import Logo from './components/Logo.vue';

export default {
  data() {
    return {
      selected: '',
      loading: false,
      baseUrl: 'https://api.bavatars.co/api/bavatars',
      avatars: null,
      gender: [
        { name: 'male', active: false },
        { name: 'female', active: false }
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

        const ageFilter = this.selected
          ? avatar.age_range === this.selected
          : true;

        return gFilter && nFilter && ageFilter;
      });
    },
    oneActive() {
      const genderFilter = this.gender.find(gender => gender.active === true);
      const natureFilter = this.nature.find(nature => nature.active === true);

      return (
        Boolean(genderFilter) || Boolean(natureFilter) || Boolean(this.selected)
      );
    }
  },

  components: {
    Welcome,
    Close,
    Logo
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
    },

    setGender(name = null, reset = false) {
      this.gender = this.gender.map(item => {
        if (!reset) {
          if (item.name === name) {
            return {
              ...item,
              active: !item.active
            };
          } else {
            return {
              ...item,
              active: false
            };
          }
        } else {
          return {
            ...item,
            active: false
          };
        }
      });
    },
    setNature(name = null, reset = false) {
      this.nature = this.nature.map(item => {
        if (!reset) {
          if (item.name === name) {
            return {
              ...item,
              active: !item.active
            };
          } else {
            return {
              ...item,
              active: false
            };
          }
        } else {
          return {
            ...item,
            active: false
          };
        }
      });
    },
    resetAll() {
      this.setGender(null, true);
      this.setNature(null, true);
      this.selected = '';
    }
  }
};
</script>

<style lang="scss">
@import '../figma/figma-ds/figma-plugin-ds';
</style>
