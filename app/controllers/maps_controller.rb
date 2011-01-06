class MapsController < ApplicationController
  def new
  
  end

  def create
  end

  def show
  end

  def destroy
    Map.find(params[:id]).destroy
    flash[:success] = "Map destroyed."
    redirect_to protect_path
  end

  def gamehandler
  end

  def protect_index
    @maps = Map.find_all_by_user_id("1")
  end
  
  def destroy_index
    @rand_maps = Map.find(:all, :offset => (Map.count * rand).to_i, :limit => 5)
  end
  
end
