import { Input } from '@heroui/react'

const AddProduct = () => {
  return (
    <form>
      AddProduct
      <div>
        <label htmlFor='productName'>Product Name:</label>
        <Input size='sm' label='SKU' isClearable />
      </div>
      <div>
        <label htmlFor='productPrice'>Product Price:</label>
        <input type='number' id='productPrice' name='productPrice' required />
      </div>
      <div>
        <label htmlFor='productDescription'>Product Description:</label>
        <textarea id='productDescription' name='productDescription' required></textarea>
      </div>
      <button type='submit'>Add Product</button>
    </form>
  )
}

export default AddProduct
