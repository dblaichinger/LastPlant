class MapsController < ApplicationController
  protect_from_forgery :except => [:create]

  def new
  
  end

  def create
    mapname = User.find_by_id(session[:id]).name + "'s " + Map.find_all_by_user_id(session[:id]).count.to_s + ". Map"
    Map.create(:name => mapname, :user_id => session[:id], :content => params[:map])

    redirect_to protect_path
  end

  def show
  end

  def destroy
    @map = Map.find(params[:id])
    flash[:success] = "Map destroyed."
    redirect_to protect_path
  end

  def gamehandler
  end

  def protect_index
    @maps = Map.find_all_by_user_id(session[:id])
  end
  
  def destroy_index
    @rand_maps = Map.find(:all, :offset => (Map.count * rand).to_i, :limit => 5)
  end
  
end
