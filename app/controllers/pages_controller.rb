class PagesController < ApplicationController

  def about
    @title = "About"
  end
  
  def imprint
    @title = "Imprint"
  end
end
