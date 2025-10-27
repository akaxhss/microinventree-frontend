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
import ViewPackingslips from '../pages/ViewPackingslip.vue'
import ListOfStockByInvoice from '../pages/child/ListOfStock-iteamsByInvoiceNo.vue'
import EditOfStockByInvoice from '../pages/child/EditStock-itemsByInvoice.vue'
import ViewEditByInvoice from '../pages/View-Edit-ByInvoice.vue'
import ListViewSuppliers from '@/pages/ListViewSuppliers.vue'
import AddSuppliers from '@/pages/AddSuppliers.vue'
import ListViewCustomer from '@/pages/ListViewCustomer.vue'
import AddCustomer from '@/pages/AddCustomer.vue'



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
  { path: '/viewpackingslips', component: ViewPackingslips },
  { path: '/viewstockbyinvoice', component: ListOfStockByInvoice },
  { path: '/editsockbyinvoice', component: EditOfStockByInvoice },
    { path: '/vieweditbyinvoice', component: ViewEditByInvoice },
    { path: '/listviewsupplier', component: ListViewSuppliers },
    { path: '/add-supplier', component: AddSuppliers },
    { path: '/listviewcustomer', component: ListViewCustomer },
    { path: '/add-customer', component: AddCustomer },
]

const router = createRouter({ history: createWebHistory(), routes })

export default router
