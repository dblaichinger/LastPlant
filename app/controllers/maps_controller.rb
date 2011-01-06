class MapsController < ApplicationController
  def new
  end

  def create
  end

  def show
  end

  def destroy
  end

  def gamehandler
  end

  def protect_index
    @maps = Map.find_all_by_user_id("1")
  end
  
  def destroy_index
  end
  
end
