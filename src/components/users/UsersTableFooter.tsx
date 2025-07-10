interface ProductsTableFooterProps {
  filteredItemsCount: number
}

const UsersTableFooter = ({ filteredItemsCount }: ProductsTableFooterProps) => {
  return (
    <footer className={`text-sm bg-gray-100  text-gray-700 z-10 fixed bottom-0 left-0 right-0 flex justify-center items-center p-1`}>
      <section className='container mx-auto px-6 pb-2  flex justify-between items-center'>
        <div>{filteredItemsCount} resultados encontrados</div>
        {/* <div className='flex items-center gap-2'>
          {selectedCategories.length > 0
            ? selectedCategories.map((categoryId) => {
                const category = rxCategories.find((c) => c.id === Number(categoryId))
                return (
                  <Chip key={categoryId} className={category?.color || 'bg-gray-300'} size='sm' variant='flat'>
                    {category?.description}
                  </Chip>
                )
              })
            : ''}
          {selectedCategories.length > 0 && selectedProviders.length > 0 ? ' de ' : ''}
          {selectedProviders.length > 0
            ? formatListWithY(
                selectedProviders.map((providerId) => {
                  const provider = rxProducts.find((p) => p.provider === Number(providerId))
                  return provider?.provider_name
                })
              )
            : ''}
        </div> */}
      </section>
    </footer>
  )
}

export default UsersTableFooter
