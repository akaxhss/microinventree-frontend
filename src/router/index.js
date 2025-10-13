import { createRouter, createWebHistory } from 'vue-router'
import ColorsPage from '../pages/ColorsPage.vue'
import CustomersPage from '../pages/CustomersPage.vue'
import ProductsPage from '../pages/ProductsPage.vue'
import ProductVariantsPage from '../pages/ProductVariantsPage.vue'
import SizesPage from '../pages/SizesPage.vue'
import StockItemsPage from '../pages/StockItemsPage.vue'
import StockMovementsPage from '../pages/StockMovementsPage.vue'
import InvoicesPage from '../pages/InvoicesPage.vue'
import Reports from '../pages/reports.vue'
import LoginPage from '../views/Login.vue'
import Home from '../pages/Home.vue'
import AddStock from '../pages/AddStock.vue'
import PackingSlip from '../pages/PackingSlip.vue'
import Suppliers from '../pages/SuppliersPage.vue'
import Database from '../pages/Database.vue'
import Auditlogs from '../pages/Auditlogs.vue'
import PackingSlipeditable from '../pages/PackingSlipeditable.vue'
import ListOfStockBySuppliers from '../pages/child/ListOfStock-iteamsBySupplier.vue'

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/colors', component: ColorsPage },
  { path: '/customers', component: CustomersPage },
  { path: '/products', component: ProductsPage },
  { path: '/product-variants', component: ProductVariantsPage },
  { path: '/sizes', component: SizesPage },
  { path: '/stock-items', component: StockItemsPage },
  { path: '/stock-movements', component: StockMovementsPage },
  { path: '/invoices', component: InvoicesPage },
  { path: '/reports', component: Reports },
  { path: '/home', component: Home },
  { path: '/addstock', component: AddStock },
  { path: '/packingslip', component: PackingSlip },
  { path: '/suppliers', component: Suppliers },
  { path: '/databasebackup', component: Database },
  { path: '/auditlogs', component: Auditlogs },
  { path: '/packingslipeditable', component: PackingSlipeditable },
  { path: '/stockbysuppliers', component: ListOfStockBySuppliers },
]

const router = createRouter({ history: createWebHistory(), routes })

export default router
