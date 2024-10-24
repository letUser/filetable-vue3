import { render, h } from 'vue'
import LoadingIcon from '@/components/icons/LoadingIcon.vue'

const VLoading = {
  mounted: (el: HTMLElement, state: { value: boolean }) => {
    if (state.value) {
      const div = document.createElement('div')

      div.className = 'loading-mask'
      div.style.height = `${el.offsetHeight - 2}px`
      div.style.width = `${el.offsetWidth - 2}px`
      div.dataset.testid = 'loading'

      const loader = h(LoadingIcon) // create icon as a Vue component
      render(loader, div) // append it to div

      el.prepend(div)
    } else {
      const div = el.querySelector('.loading-mask')
      div?.remove()
    }
  },
}

export default VLoading