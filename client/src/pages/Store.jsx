import React from 'react'

function Store() {
  return (
    <div className="h-[calc(100%-80px)] w-[calc(100%-100px)] ml-[100px] px-10 flex flex-col gap-10">
      <h1 className="text-[50px] font-bold">Store</h1>
      
      {/* Opening Soon Section */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="text-8xl mb-8">
            🚀
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Opening Soon
          </h2>
          <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
            We're working hard to bring you an amazing shopping experience. 
            Stay tuned for our grand opening!
          </p>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Coming Soon • 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Store