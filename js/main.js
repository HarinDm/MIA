
//vue
//FIXME: global window
//TODO: single responsibility 
//TODO: сделать paypal через vue 
//TODO: сделать оптимизацию кода
document.addEventListener("DOMContentLoaded", function (event) {
  console.log("DOM fully loaded and parsed");
  
  var DEV=new URL(window.location.href).searchParams.get('dev');
  const vueApp = document.getElementById('app');
  if (vueApp) {
    const { createApp } = Vue;
    const { createVuetify } = Vuetify;
    const vuetify = createVuetify();

    const app = createApp({
      el: "#app",
      data: () => ({
        formValid: false,
        subTier: window.SUB_TIER,
        planBasic: window.PLAN_BASIC,
        planPremium: window.PLAN_PREMIUM,
        userPlanBasic: window.USER_PLAN_BASIC,
        userPlanPremium: window.USER_PLAN_PREMIUM,
        isDEV: DEV,
        question: 'What is your biggest regret?',
        textarea: '',
        email: '',
        isSectionTGApp: false,
        quizSection: 0,
        isShowGetInstructions: false,
        emailRules: [
          v => !!v || 'E-mail is required',
          v => /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()\\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) || 'E-mail must be valid',
        ],
        textareaRules: [
          v => !!v || 'Answer is required',
        ],
      }),

      computed: {
        pricePlanBasic() {
          return this.isDEV ? 1 : 25;
        },
        pricePlanPremium() {
          return this.isDEV ? 3 : 49;
        },

        upgradeFor() {
          return this.pricePlanPremium - this.pricePlanBasic;
        },

        basicPlanText() {
          if (this.subTier === this.planBasic) {
            return "You're already signed up."
          } else if (this.subTier === this.planPremium) {
            return "Go back to self-help plan"
          } else {
            return `${this.pricePlanBasic}$ per mounth`
          }


        },
        premiumPlanText() {
          if (this.subTier === this.planBasic) {
            return `Upgrade for ${this.upgradeFor}$`
          } else if (this.subTier === this.planPremium) {
            return "You're already signed up."
          } else {
            return `${this.pricePlanPremium}$ per mounth`
          }
        },
      },
      methods: {
        nextSection(){
          if(this.formValid){
            this.isSectionTGApp = true
          } else {
          }
        }
      },

    })
    app.use(vuetify).mount('#app');
  }



  // набор текста
  class Writer {
    constructor(node) {
      this.node = node;

      if (!this.node) return;

      this.timer = 20; // .2s
      this.broken = [...this.node.querySelectorAll('p')].map(item => item.textContent);

      this._init();
    }

    _init() {
      // this.node.textContent = '';

      let self = this;
      let conter = 0;
      this.node.querySelectorAll('p').forEach(item => {
        item.textContent = '';
      })

      function writeText(idx) {
        let items = self.node.querySelectorAll('p');
        if (items[idx]) {
          items[idx].textContent = '';
          let i = 0;
          let interval = setInterval(() => {
            items[idx].textContent += self.broken[idx][i];

            i++;

            if (i >= self.broken[idx].length) {
              conter++;
              clearInterval(interval);
              writeText(conter)
           


            };
          }, self.timer);
        }


      }
      writeText(conter);


    }
  }

  // hot fix then write message 2
  const textAnswer = document.querySelector('.textAnswer');
  const message2 = document.querySelector('.message2');
  const textAnswer2 = document.querySelector('.message2 .textAnswer');

  if (textAnswer) {
    new Writer(textAnswer);
  }
  if (textAnswer2) {
    message2.style.display = "none";
    setTimeout(()=>{
      message2.style.display = "block";
      new Writer(textAnswer2);
    }, 3800)
  }



  // subscription
  const getId = new URL(window.location.href).searchParams.get('id');


  // TODO: сделать нормальную обработку запросов у paypal 
  function renderPaypalBtn(props) {
    let colorBtn = props.planName === window.PLAN_BASIC ? 'white' : 'blue'; 
    

    if(props.planName !== window.SUB_TIER){
      paypal.Buttons({
        style: {
          layout: 'vertical',
          color:  colorBtn,
          shape:  'pill',
        },
        onInit: function(data, actions) {
  
          // Listen for changes to the checkbox
          if (props.planName === window.SUB_TIER) {
            actions.disable();
          }
  
        },
        createSubscription: function (data, actions) {
          // FIXME 
          const subscription = {
            plan_id: null,
            custom_id: getId,
          }
  
          if (props.planName === window.PLAN_BASIC) {
            subscription.plan_id = window.USER_PLAN_BASIC;
            if (window.SUB_TIER) {
              subscription['start_time'] = window.START_TIME;
            }
          }
  
          if (props.planName === window.PLAN_PREMIUM) {
            subscription.plan_id = window.USER_PLAN_PREMIUM;
            if (window.SUB_TIER) {
              // FIXME 
              const priceUpgrade = DEV ? '2' : '24';
              subscription['start_time'] = window.START_TIME;
              subscription['shipping_amount'] = {
                "currency_code": "USD",
                "value": priceUpgrade
              }
            }
          }
  
          return actions.subscription.create(subscription);
        },
  
        onApprove: function (data, actions) {
          window.location.href = 'https://miahelps.com/success';
        },
        onCancel: function (data) {
          window.location.href = 'https://miahelps.com/cancel';
        }
  
      }) .render(`#${props.id}`);
    }
   
  }

  if (getId) {
    document.querySelectorAll('.paypal-button-container').forEach(btn => {
      renderPaypalBtn(
        {
          id: btn.id,
          planName: btn.dataset.planName
        })
    })
  }
});