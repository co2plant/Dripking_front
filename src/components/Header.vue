<template>
  <div class="bg-white">
    <header class="inset-x-0 top-0 z-50">
      <nav class="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div class="flex lg:flex-1">
          <a href="/" class="-m-1.5 p-1.5">
            <span class="sr-only">Dripking</span>
            <img class="h-16 w-auto" src="../assets/Dripking_logo.png" alt="" />
          </a>
        </div>
        <div class="flex lg:hidden">
          <button type="button" class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-zinc-700" @click="mobileMenuOpen = true">
            <span class="sr-only">Open main menu</span>
            <Bars3Icon class="size-6" aria-hidden="true" />
          </button>
        </div>
        <div class="hidden lg:flex lg:gap-x-12">
          <a v-for="item in navigation" :key="item.name" :href="item.href" class="text-sm/6 font-semibold text-zinc-900">{{ item.name }}</a>
        </div>
        <div v-if="authStore.isSignedIn" class="hidden lg:flex lg:flex-1 lg:justify-end">
          <button
              @click="handleSignOut"
              class="justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-400 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            로그아웃
          </button>
        </div>
        <div v-else class="hidden lg:flex lg:flex-1 lg:justify-end">
          <button
              @click="showAuthModal = true"
              class="justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-400 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            로그인 / 회원가입
          </button>
        </div>


        <Modal :show="showAuthModal" @close="showAuthModal = false">
          <AuthenticationForm />
        </Modal>
      </nav>
      <Dialog class="lg:hidden" @close="mobileMenuOpen = false" :open="mobileMenuOpen">
        <div class="fixed inset-0 z-50" />
        <DialogPanel class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-zinc-900/10">
          <div class="flex items-center justify-between">
            <a href="/" class="-m-1.5 p-1.5">
              <span class="sr-only">Dripking</span>
              <img class="h-8 w-auto" src="../assets/Dripking_logo.png" alt="Dripking" />
            </a>
            <button type="button" class="-m-2.5 rounded-md p-2.5 text-zinc-700" @click="mobileMenuOpen = false">
              <span class="sr-only">Close menu</span>
              <XMarkIcon class="size-6" aria-hidden="true" />
            </button>
          </div>
          <div class="mt-6 flow-root">
            <div class="-my-6 divide-y divide-zinc-500/10">
              <div class="space-y-2 py-6">
                <a v-for="item in navigation" :key="item.name" :href="item.href" class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-zinc-900 hover:bg-zinc-50">{{ item.name }}</a>
              </div>
              <div class="py-6" v-if="authStore.isSignedIn">
                <a href="#"
                   @click="handleSignOut"
                   class="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-zinc-900 hover:bg-zinc-50">
                  로그아웃
                </a>
              </div>
              <div class="py-6" v-else>
                <a
                    @click="showAuthModal = true"
                    class="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-zinc-900 hover:bg-zinc-50"
                >
                  로그인 / 회원가입
                </a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {Dialog, DialogPanel} from '@headlessui/vue'
import {Bars3Icon, XMarkIcon} from '@heroicons/vue/24/outline'
import Modal from './Modal.vue'
import AuthenticationForm from './Authentication/AuthenticationForm.vue'
import {useAuthStore} from '@/stores/useAuthStore'

const navigation = [
      {name: 'Discover', href: '/destinationList'},
      {name: 'Trips', href: '#'},
      {name: 'Alcohol', href: '/alcoholList'},
      {name: 'More', href: '#'},
]

const authStore = useAuthStore();

const handleSignOut = () => {
  authStore.signOut();
}

onMounted(() => {
  authStore.initAuth();
})

const showAuthModal = ref(false)
const mobileMenuOpen = ref(false)
</script>